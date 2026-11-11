import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WEBHOOK_URL: '@it_support_webhook_url',
  SUBMISSIONS: '@it_support_submissions_history',
};

export const getStoredWebhookUrl = async () => {
  try {
    const url = await AsyncStorage.getItem(STORAGE_KEYS.WEBHOOK_URL);
    return url || '';
  } catch (error) {
    console.error('Error reading webhook url:', error);
    return '';
  }
};

export const saveWebhookUrl = async (url) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url.trim());
    return true;
  } catch (error) {
    console.error('Error saving webhook url:', error);
    return false;
  }
};

export const getSubmissionsHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error reading submissions history:', error);
    return [];
  }
};

export const saveSubmissionToHistory = async (submission) => {
  try {
    const existing = await getSubmissionsHistory();
    const updated = [submission, ...existing];
    await AsyncStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated.slice(0, 100))); // keep latest 100
    return updated;
  } catch (error) {
    console.error('Error saving submission to history:', error);
    return [];
  }
};

export const clearSubmissionsHistory = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.SUBMISSIONS);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

