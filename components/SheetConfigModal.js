import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { DEFAULT_SHEET_URL, DEFAULT_SHEET_ID } from '../constants/defaultSkills';
import { saveWebhookUrl } from '../services/storageService';
import { testWebhookConnection } from '../services/sheetService';

const APPS_SCRIPT_CODE = `function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = {};
    if (e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch(err) { data = e.parameter || {}; }
    } else if (e.parameter) {
      data = e.parameter;
    }
    if (sheet.getLastRow() === 0) {
      var headers = ["កាលបរិច្ឆេទ", "ឈ្មោះ", "លេខទូរស័ព្ធ", "Telegram", "Email", "ជំនាញស្រឡាញ់", "គោលបំណង IT Support"];
      sheet.appendRow(headers);
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1E40AF");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
    }
    var timestamp = Utilities.formatDate(new Date(), "Asia/Phnom_Penh", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([
      data.timestamp || timestamp,
      data.name || "",
      data.phone || "",
      data.telegram || "",
      data.email || "",
      data.skill || "",
      data.purpose || ""
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "active", message: "IT Support Webhook is running!" })).setMimeType(ContentService.MimeType.JSON);
}`;

export default function SheetConfigModal({
  visible,
  onClose,
  currentUrl,
  onSaveUrl,
}) {
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync currentUrl when modal opens
  React.useEffect(() => {
    setUrlInput(currentUrl || '');
    setTestResult(null);
  }, [currentUrl, visible]);

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim()) {
      setTestResult({ success: false, message: 'សូមបញ្ចូល Webhook URL ជាមុនសិន' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    const res = await testWebhookConnection(urlInput.trim());
    setTesting(false);
    setTestResult(res);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveWebhookUrl(urlInput.trim());
    if (onSaveUrl) onSaveUrl(urlInput.trim());
    setSaving(false);
    onClose();
  };

  const openSheet = () => {
    Linking.openURL(DEFAULT_SHEET_URL);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleWrap}>
              <Ionicons name="settings" size={22} color={COLORS.primary} />
              <Text style={styles.headerTitle}>ការតភ្ជាប់ Google Sheet</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
          >
            {/* Sheet Info Box */}
            <View style={styles.sheetInfoBox}>
              <View style={styles.sheetInfoIcon}>
                <Ionicons name="grid" size={24} color="#10B981" />
              </View>
              <View style={styles.sheetInfoContent}>
                <Text style={styles.sheetInfoTitle}>Google Sheet គោលដៅ</Text>
                <Text style={styles.sheetIdText} numberOfLines={1}>
                  ID: {DEFAULT_SHEET_ID}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.openSheetBtn}
                onPress={openSheet}
                activeOpacity={0.8}
              >
                <Text style={styles.openSheetBtnText}>បើក Sheet</Text>
                <Ionicons name="open-outline" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Webhook URL Input Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Google Apps Script Webhook URL:
              </Text>
              <Text style={styles.sectionDesc}>
                បិទភ្ជាប់ (Paste) តំណភ្ជាប់ Web app URL ដែលបានពី Apps Script Deployment ខាងក្រោម៖
              </Text>

              <View style={styles.urlInputWrap}>
                <Ionicons name="link" size={18} color={COLORS.primary} />
                <TextInput
                  style={styles.urlTextInput}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  placeholderTextColor={COLORS.textMuted}
                  value={urlInput}
                  onChangeText={setUrlInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {urlInput.length > 0 && (
                  <TouchableOpacity onPress={() => setUrlInput('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.testRow}>
                <TouchableOpacity
                  style={[styles.testBtn, testing && styles.btnDisabled]}
                  onPress={handleTestConnection}
                  disabled={testing}
                >
                  {testing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="pulse" size={15} color="#FFFFFF" />
                      <Text style={styles.testBtnText}>ធ្វើតេស្តការតភ្ជាប់</Text>
                    </>
                  )}
                </TouchableOpacity>

                {testResult && (
                  <View
                    style={[
                      styles.testResultBadge,
                      testResult.success
                        ? styles.testSuccessBadge
                        : styles.testErrorBadge,
                    ]}
                  >
                    <Ionicons
                      name={testResult.success ? 'checkmark-circle' : 'alert-circle'}
                      size={15}
                      color={testResult.success ? '#10B981' : '#EF4444'}
                    />
                    <Text
                      style={[
                        styles.testResultText,
                        testResult.success
                          ? styles.testSuccessText
                          : styles.testErrorText,
                      ]}
                      numberOfLines={1}
                    >
                      {testResult.message}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Step-by-step Setup Guide */}
            <View style={styles.guideCard}>
              <View style={styles.guideHeader}>
                <Ionicons name="help-circle" size={18} color={COLORS.primary} />
                <Text style={styles.guideTitle}>
                  របៀបបង្កើត Apps Script Webhook (ចំណាយពេលត្រឹម 1 នាទី)៖
                </Text>
              </View>

              <StepItem
                num="១"
                text="បើក Google Sheet ហើយចុចលើ Extensions (ផ្នែកបន្ថែម) -> Apps Script"
              />
              <StepItem
                num="២"
                text="លុបកូដចាស់ចោល រួចចម្លង (Copy) កូដខាងក្រោមទៅបិទភ្ជាប់ (Paste)"
              />

              {/* Code Snippet Box */}
              <View style={styles.codeBox}>
                <View style={styles.codeHeader}>
                  <Text style={styles.codeFilename}>google-apps-script.js</Text>
                  <TouchableOpacity
                    style={styles.copyBtn}
                    onPress={handleCopyCode}
                  >
                    <Ionicons
                      name={copied ? 'checkmark' : 'copy-outline'}
                      size={14}
                      color={copied ? '#10B981' : COLORS.primary}
                    />
                    <Text
                      style={[
                        styles.copyBtnText,
                        copied && { color: '#10B981' },
                      ]}
                    >
                      {copied ? 'បានចម្លងរួច!' : 'ចម្លងកូដ (Copy)'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.codePreview} numberOfLines={4}>
                  {APPS_SCRIPT_CODE}
                </Text>
              </View>

              <StepItem
                num="៣"
                text="ចុច Deploy (ដាក់ឱ្យប្រើ) -> New deployment -> ជ្រើសរើស Web app"
              />
              <StepItem
                num="៤"
                text="ត្រង់ Execute as: ជ្រើសយក Me | Who has access: ជ្រើសយក Anyone (សំខាន់!)"
              />
              <StepItem
                num="៥"
                text="ចុច Deploy រួចចម្លងយក Web app URL មកដាក់ក្នុងប្រអប់ខាងលើ"
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelBtnText}>បិទ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>រក្សាទុក URL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StepItem({ num, text }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{num}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(5px)' } : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
  },
  scrollArea: {
    width: '100%',
  },
  sheetInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 16,
    gap: 10,
  },
  sheetInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetInfoContent: {
    flex: 1,
  },
  sheetInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  sheetIdText: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
  },
  openSheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  openSheetBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  urlInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  urlTextInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  testRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  testResultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
    flex: 1,
  },
  testSuccessBadge: {
    backgroundColor: '#ECFDF5',
  },
  testErrorBadge: {
    backgroundColor: '#FEF2F2',
  },
  testResultText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  testSuccessText: {
    color: '#059669',
  },
  testErrorText: {
    color: '#DC2626',
  },
  guideCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  guideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepNum: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  codeBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginVertical: 4,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 6,
    marginBottom: 6,
  },
  codeFilename: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  copyBtnText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  codePreview: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelBtnText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  saveBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

