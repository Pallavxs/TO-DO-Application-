import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api';

// ─────────────────────────────────────────────────────────────────
// PRIORITY CONFIG — colours for High / Medium / Low buttons
// ─────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  High:   { color: '#EF4444', bg: '#FEE2E2' },
  Medium: { color: '#F97316', bg: '#FFEDD5' },
  Low:    { color: '#10B981', bg: '#D1FAE5' },
};

// ─────────────────────────────────────────────────────────────────
// ADD TODO SCREEN
//
// Props:
//   navigation — provided by React Navigation.
//                We use navigation.goBack() to return to HomeScreen.
//                We also use navigation.navigate() to pass the
//                'refresh: true' param back to HomeScreen so it
//                knows to reload the list.
// ─────────────────────────────────────────────────────────────────
export default function AddTodoScreen({ navigation }) {

  // ── STATE ──────────────────────────────────────────────────────
  // title: the text the user types in the task input field
  const [title,    setTitle]    = useState('');
  // priority: the currently selected priority (High / Medium / Low)
  const [priority, setPriority] = useState('Medium');
  // saving: prevents the user from tapping Save multiple times
  const [saving,   setSaving]   = useState(false);

  // ── SAVE HANDLER ───────────────────────────────────────────────
  const handleSave = async () => {
    // Validation: don't allow empty task titles
    if (title.trim() === '') {
      Alert.alert('Oops!', 'Please enter a task title before saving.');
      return;
    }

    try {
      setSaving(true); // disable the button while request is in flight

      // POST /todos — send title and priority to the backend
      await api.post('/', { title: title.trim(), priority });

      // After saving, go back to HomeScreen AND pass refresh:true
      // HomeScreen listens to route.params.refresh to auto-reload the list
      navigation.navigate('Home', { refresh: true });

    } catch (error) {
      console.error('Error saving todo:', error);
      Alert.alert('Error', 'Could not save task. Check your backend connection.');
    } finally {
      setSaving(false);
    }
  };

  // ── CANCEL HANDLER ─────────────────────────────────────────────
  // navigation.goBack() simply pops this screen off the stack
  // and returns to whatever screen was shown before (HomeScreen).
  const handleCancel = () => navigation.goBack();

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* ── TOP BAR ── */}
          {/* Back arrow + screen title */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleCancel} style={styles.backBtn}>
              <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Add New Todo</Text>
            {/* Empty view keeps the title centered */}
            <View style={{ width: 40 }} />
          </View>

          {/* ── CARD / FORM ── */}
          <View style={styles.card}>

            {/* Task title input */}
            <Text style={styles.label}>Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="What needs to be done?"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
              autoFocus        // keyboard opens automatically
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            {/* Priority selector */}
            <Text style={[styles.label, { marginTop: 20 }]}>Priority</Text>
            <View style={styles.priorityRow}>
              {['High', 'Medium', 'Low'].map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setPriority(p)}
                    style={[
                      styles.priorityBtn,
                      { borderColor: cfg.color },
                      isActive && { backgroundColor: cfg.color },
                    ]}
                    activeOpacity={0.75}
                  >
                    <Text style={[
                      styles.priorityBtnText,
                      { color: isActive ? 'white' : cfg.color },
                    ]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Priority description hint */}
            <Text style={styles.priorityHint}>
              {priority === 'High'   && '🔴  This task needs immediate attention.'}
              {priority === 'Medium' && '🟠  This task is moderately important.'}
              {priority === 'Low'    && '🟢  This task can be done when you have time.'}
            </Text>

          </View>

          {/* ── ACTION BUTTONS ── */}
          {/* Save Todo */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <MaterialIcons name="check" size={20} color="white" style={{ marginRight: 6 }} />
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Todo'}</Text>
          </TouchableOpacity>

          {/* Cancel / Back */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES — white background, blue accent, clean spacing
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scroll:    { padding: 20, flexGrow: 1 },

  // Top bar (back + title)
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },

  // Form card
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },

  // Field label
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Title TextInput
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },

  // Priority buttons
  priorityRow:    { flexDirection: 'row', gap: 10 },
  priorityBtn:    { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, alignItems: 'center' },
  priorityBtnText:{ fontSize: 14, fontWeight: '600' },

  // Hint text under priority selector
  priorityHint: {
    marginTop: 10,
    fontSize: 13,
    color: '#94A3B8',
  },

  // Save button
  saveBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText:     { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Cancel button
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
});
