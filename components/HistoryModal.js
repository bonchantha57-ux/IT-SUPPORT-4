import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../constants/theme';
import { clearSubmissionsHistory } from '../services/storageService';

export default function HistoryModal({
  visible,
  onClose,
  history = [],
  onHistoryCleared,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    const term = searchTerm.toLowerCase().trim();
    return history.filter(
      (item) =>
        (item.name && item.name.toLowerCase().includes(term)) ||
        (item.phone && item.phone.includes(term)) ||
        (item.telegram && item.telegram.toLowerCase().includes(term)) ||
        (item.email && item.email.toLowerCase().includes(term)) ||
        (item.skill && item.skill.toLowerCase().includes(term))
    );
  }, [history, searchTerm]);

  const handleExportCSV = () => {
    if (!history || history.length === 0) return;

    const headers = [
      'កាលបរិច្ឆេទ (Timestamp)',
      'ឈ្មោះ (Full Name)',
      'លេខទូរស័ព្ធ (Phone Number)',
      'Telegram Username',
      'Email',
      'ជំនាញស្រឡាញ់ (Skills)',
      'គោលបំណង IT Support (Purpose)',
    ];

    const rows = history.map((item) => [
      `"${(item.timestamp || '').replace(/"/g, '""')}"`,
      `"${(item.name || '').replace(/"/g, '""')}"`,
      `"${(item.phone || '').replace(/"/g, '""')}"`,
      `"${(item.telegram || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.skill || '').replace(/"/g, '""')}"`,
      `"${(item.purpose || '').replace(/"/g, '""')}"`,
    ]);

    // \uFEFF UTF-8 BOM ensures Excel displays Khmer characters correctly
    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `IT_Support_Candidates_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert(
        'ទាញយក CSV',
        'មុខងារ Download CSV ដំណើរការយ៉ាងពេញលេញលើ Web Browser'
      );
    }
  };

  const handleClear = () => {
    const performClear = async () => {
      await clearSubmissionsHistory();
      if (onHistoryCleared) onHistoryCleared();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('តើអ្នកពិតជាចង់លុបប្រវត្តិទិន្នន័យទាំងអស់មែនទេ?')) {
        performClear();
      }
    } else {
      Alert.alert(
        'លុបប្រវត្តិទិន្នន័យ',
        'តើអ្នកពិតជាចង់លុបប្រវត្តិទិន្នន័យទាំងអស់មែនទេ?',
        [
          { text: 'បោះបង់', style: 'cancel' },
          { text: 'លុប', style: 'destructive', onPress: performClear },
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.nameSection}>
          <Text style={styles.candidateName}>{item.name || 'គ្មានឈ្មោះ'}</Text>
          <Text style={styles.timestampText}>{item.timestamp}</Text>
        </View>
        <View
          style={[
            styles.statusTag,
            item.status === 'synced'
              ? styles.statusSynced
              : styles.statusLocal,
          ]}
        >
          <Ionicons
            name={item.status === 'synced' ? 'cloud-done' : 'save'}
            size={12}
            color={item.status === 'synced' ? '#10B981' : '#F59E0B'}
          />
          <Text
            style={[
              styles.statusText,
              item.status === 'synced' ? styles.syncedText : styles.localText,
            ]}
          >
            {item.status === 'synced' ? 'Google Sheet' : 'Local'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="call" size={13} color={COLORS.primary} />
        <Text style={styles.infoText}>{item.phone || '-'}</Text>

        <Ionicons
          name="paper-plane"
          size={13}
          color={COLORS.telegram}
          style={{ marginLeft: 8 }}
        />
        <Text style={styles.infoText}>{item.telegram || '-'}</Text>
      </View>

      {item.email ? (
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={13} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.email}</Text>
        </View>
      ) : null}

      {item.skill ? (
        <View style={styles.skillBox}>
          <Text style={styles.skillLabel}>ជំនាញ៖</Text>
          <Text style={styles.skillValue} numberOfLines={2}>
            {item.skill}
          </Text>
        </View>
      ) : null}

      {item.purpose ? (
        <View style={styles.purposeBox}>
          <Text style={styles.purposeText} numberOfLines={2}>
            "{item.purpose}"
          </Text>
        </View>
      ) : null}
    </View>
  );

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
            <View style={styles.modalHeaderTitle}>
              <Ionicons name="time" size={22} color={COLORS.primary} />
              <Text style={styles.headerTitle}>ប្រវត្តិទិន្នន័យដែលបានបញ្ចូល</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          {history.length > 0 && (
            <View style={styles.searchBar}>
              <Ionicons name="search" size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="ស្វែងរកតាមឈ្មោះ លេខទូរស័ព្ធ ឬជំនាញ..."
                placeholderTextColor={COLORS.textMuted}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
              {searchTerm ? (
                <TouchableOpacity onPress={() => setSearchTerm('')}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>
          )}

          {/* Summary and Actions Bar */}
          <View style={styles.summaryBar}>
            <Text style={styles.summaryText}>
              ទិន្នន័យសរុប៖{' '}
              <Text style={{ fontWeight: 'bold' }}>{history.length}</Text> នាក់
              {searchTerm ? ` (ត្រូវគ្នា: ${filteredHistory.length})` : ''}
            </Text>

            <View style={styles.summaryActions}>
              {history.length > 0 && (
                <>
                  <TouchableOpacity
                    onPress={handleExportCSV}
                    style={styles.exportBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="download-outline" size={13} color="#047857" />
                    <Text style={styles.exportBtnText}>Excel/CSV</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
                    <Ionicons name="trash-outline" size={13} color={COLORS.error} />
                    <Text style={styles.clearBtnText}>លុប</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* List */}
          {filteredHistory.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>
                {searchTerm
                  ? 'មិនមានទិន្នន័យដែលត្រូវនឹងពាក្យស្វែងរកទេ'
                  : 'មិនទាន់មានទិន្នន័យនៅឡើយទេ'}
              </Text>
              <Text style={styles.emptySubtitle}>
                ទិន្នន័យដែលអ្នកបានបំពេញ នឹងបង្ហាញនៅទីនេះ
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredHistory}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              style={{ width: '100%' }}
            />
          )}

          {/* Close button */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>បិទ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...(Platform.OS === 'web' ? { backdropFilter: 'blur(5px)' } : {}),
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...SHADOWS.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalHeaderTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.text,
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  summaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  exportBtnText: {
    fontSize: 11.5,
    color: '#047857',
    fontWeight: '700',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  clearBtnText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  listContent: {
    gap: 12,
    paddingBottom: 8,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    gap: 6,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSection: {
    flex: 1,
  },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  timestampText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  statusSynced: {
    backgroundColor: '#ECFDF5',
  },
  statusLocal: {
    backgroundColor: '#FFFBEB',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  syncedText: {
    color: '#059669',
  },
  localText: {
    color: '#D97706',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  infoText: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
  },
  skillBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  skillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  skillValue: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 2,
  },
  purposeBox: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    paddingLeft: 8,
    marginTop: 4,
  },
  purposeText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
