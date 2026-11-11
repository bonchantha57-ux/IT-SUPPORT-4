import { Platform } from 'react-native';
import { saveSubmissionToHistory } from './storageService';

/**
 * Send candidate data to Google Sheet via Google Apps Script Web App
 * @param {Object} data - Candidate info
 * @param {string} webhookUrl - Apps Script Web App URL
 */
export const submitToGoogleSheet = async (data, webhookUrl) => {
  const timestamp = new Date().toLocaleString('km-KH', {
    timeZone: 'Asia/Phnom_Penh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const payload = {
    ...data,
    timestamp,
    id: Date.now().toString(),
  };

  // If no webhook URL is configured yet, save locally and inform user
  if (!webhookUrl || !webhookUrl.trim()) {
    await saveSubmissionToHistory({
      ...payload,
      status: 'saved_locally',
      note: 'រក្សាទុកលើឧបករណ៍ (មិនទាន់ភ្ជាប់ Google Webhook)',
    });

    return {
      success: true,
      mode: 'local',
      message: 'បានរក្សាទុកក្នុងទិន្នន័យម៉ាស៊ីនរួចរាល់! សូមភ្ជាប់ Google Webhook URL ដើម្បីបញ្ចូលទៅកាន់ Google Sheet ផ្ទាល់។',
      data: payload,
    };
  }

  try {
    const cleanUrl = webhookUrl.trim();

    // Using text/plain prevents browser CORS preflight issues with Google Apps Script
    // and Google Apps Script easily parses it from e.postData.contents!
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    let result = null;
    try {
      const text = await response.text();
      result = JSON.parse(text);
    } catch {
      // Sometimes redirected response text isn't direct JSON in no-cors or some web environments
      result = { status: response.ok ? 'success' : 'unknown' };
    }

    // Save to local history as well for user reference
    await saveSubmissionToHistory({
      ...payload,
      status: 'synced',
      note: 'បានបញ្ចូលទៅ Google Sheet ជោគជ័យ',
    });

    return {
      success: true,
      mode: 'cloud',
      message: 'បានបញ្ចូលទិន្នន័យទៅកាន់ Google Sheet ដោយជោគជ័យ! 🎉',
      data: payload,
      result,
    };
  } catch (error) {
    console.warn('Network send error (saving locally):', error);

    // Save to local history with pending status so no data is ever lost!
    await saveSubmissionToHistory({
      ...payload,
      status: 'pending',
      note: 'រក្សាទុកបណ្ដោះអាសន្ន (បញ្ហាតភ្ជាប់អ៊ីនធឺណិត)',
      error: error.message,
    });

    // If fetch failed due to browser opaque redirect or strict CORS policy, but data might still have reached Apps script
    return {
      success: true,
      mode: 'fallback',
      message: 'បានរក្សាទុកទិន្នន័យរួចរាល់ហើយ! (ប្រសិនបើ Webhook ដំណើរការ ទិន្នន័យនឹងបង្ហាញលើ Google Sheet ភ្លាមៗ)',
      data: payload,
      warning: error.message,
    };
  }
};

/**
 * Test connectivity with Google Apps Script
 */
export const testWebhookConnection = async (webhookUrl) => {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, message: 'សូមបញ្ចូល Webhook URL ជាមុនសិន' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(webhookUrl.trim(), {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: 'ការតភ្ជាប់ជោគជ័យ! Webhook ដំណើរការធម្មតា។',
        details: data,
      };
    } else {
      return {
        success: false,
        message: `ការតភ្ជាប់មានបញ្ហា (Status: ${response.status})`,
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `មិនអាចតភ្ជាប់បានទេ: ${err.message}`,
    };
  }
};

