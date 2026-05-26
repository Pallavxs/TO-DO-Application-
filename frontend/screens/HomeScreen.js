import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, Alert, RefreshControl, Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api';

// ─────────────────────────────────────────────────────────────────
// PRIORITY CONFIG — colours for High / Medium / Low badges
// ─────────────────────────────────────────────────────────────────
const PRIORITY_CONFIG = {
  High:   { color: '#EF4444', bg: '#FEE2E2', label: 'High' },
  Medium: { color: '#F97316', bg: '#FFEDD5', label: 'Med'  },
  Low:    { color: '#10B981', bg: '#D1FAE5', label: 'Low'  },
};

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// HOME SCREEN
// Props:
//   navigation — provided automatically by React Navigation.
//                We use it to navigate to AddTodoScreen.
//   route      — also provided automatically; we use route.params
//                to detect when we return from AddTodoScreen so
//                we can refresh the list.
// ─────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation, route }) {

  // ── STATE ──────────────────────────────────────────────────────
  const [todos,      setTodos]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter,     setFilter]     = useState('All');
  const [search,     setSearch]     = useState('');
  const [stats,      setStats]      = useState({ total: 0, completed: 0, pending: 0 });

  // Edit modal state
  const [editVisible,   setEditVisible]   = useState(false);
  const [editTodo,      setEditTodo]      = useState(null);
  const [editTitle,     setEditTitle]     = useState('');
  const [editPriority,  setEditPriority]  = useState('Medium');

  // ── EFFECTS ────────────────────────────────────────────────────

  // Run once when the screen first mounts (app opens)
  useEffect(() => {
    fetchTodos();
    fetchStats();
  }, []);

  // This effect runs every time we come BACK from AddTodoScreen.
  // route.params?.refresh is set to true by AddTodoScreen after a save.
  // This is how we auto-refresh the list without complex state management.
  useEffect(() => {
    if (route.params?.refresh) {
      fetchTodos();
      fetchStats();
      // Reset the param so re-visiting the screen doesn't re-trigger
      navigation.setParams({ refresh: false });
    }
  }, [route.params?.refresh]);

  // ── API CALLS ──────────────────────────────────────────────────

  const fetchTodos = async (searchText = search) => {
    try {
      setLoading(true);
      const url = searchText.trim()
        ? `/?search=${encodeURIComponent(searchText.trim())}`
        : '/';
      const response = await api.get(url);
      setTodos(response.data);
    } catch (error) {
      console.error('Error fetching todos:', error.message);
      Alert.alert('Connection Error', 'Cannot reach the backend.\nCheck your IP in api.js.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error.message);
    }
  };

  const refreshAll = async (searchText = search) => {
    await Promise.all([fetchTodos(searchText), fetchStats()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const toggleTodo = async (id, currentStatus) => {
    try {
      await api.patch(`/${id}`, { completed: !currentStatus });
      await refreshAll();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const confirmDelete = (id) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteTodo(id) },
      ]
    );
  };

  const deleteTodo = async (id) => {
    try {
      await api.delete(`/${id}`);
      await refreshAll();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const openEdit = (todo) => {
    setEditTodo(todo);
    setEditTitle(todo.title);
    setEditPriority(todo.priority || 'Medium');
    setEditVisible(true);
  };

  const saveEdit = async () => {
    if (editTitle.trim() === '') return;
    try {
      await api.patch(`/${editTodo._id}`, {
        title: editTitle.trim(),
        priority: editPriority,
      });
      setEditVisible(false);
      await refreshAll();
    } catch (error) {
      console.error('Error editing todo:', error);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    fetchTodos(value);
  };

  // ── CLIENT-SIDE FILTER (All / Completed / Pending) ─────────────
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'Completed') return  todo.completed;
    if (filter === 'Pending')   return !todo.completed;
    return true;
  });

  // ── RENDER ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📝 To-Do Manager</Text>

        {/* + button → navigate to AddTodoScreen */}
        {/* navigation.navigate('AddTodo') opens the AddTodoScreen */}
        <TouchableOpacity
          style={styles.addFab}
          onPress={() => navigation.navigate('AddTodo')}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── STATISTICS BAR ── */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: '#F97316' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
      </View>

      {/* ── SEARCH BAR ── */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks…"
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <MaterialIcons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── FILTER TABS ── */}
      <View style={styles.filterContainer}>
        {['All', 'Pending', 'Completed'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── TASK LIST ── */}
      {loading ? (
        <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => item._id}
          contentContainerStyle={filteredTodos.length === 0 ? styles.emptyContainer : { paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🗒️</Text>
              <Text style={styles.emptyTitle}>No tasks here!</Text>
              <Text style={styles.emptySubtitle}>
                {search ? `No results for "${search}"` : 'Tap + to add your first task.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardLeft}
                onPress={() => toggleTodo(item._id, item.completed)}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={item.completed ? 'check-circle' : 'radio-button-unchecked'}
                  size={24}
                  color={item.completed ? '#10B981' : '#9CA3AF'}
                />
                <View style={styles.cardTextBlock}>
                  <Text style={[styles.cardTitle, item.completed && styles.cardTitleDone]}>
                    {item.title}
                  </Text>
                  <PriorityBadge priority={item.priority || 'Medium'} />
                </View>
              </TouchableOpacity>

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                  <MaterialIcons name="edit" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item._id)} style={styles.iconBtn}>
                  <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* ── EDIT MODAL ── */}
      <Modal
        visible={editVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Task</Text>

            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Task title"
              autoFocus
            />

            <Text style={styles.modalLabel}>Priority</Text>
            <View style={styles.priorityRow}>
              {['High', 'Medium', 'Low'].map((p) => {
                const cfg = PRIORITY_CONFIG[p];
                const isActive = editPriority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setEditPriority(p)}
                    style={[
                      styles.priorityBtn,
                      { borderColor: cfg.color },
                      isActive && { backgroundColor: cfg.color },
                    ]}
                  >
                    <Text style={[styles.priorityBtnText, { color: isActive ? 'white' : cfg.color }]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setEditVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveEdit}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#1E293B' },
  addFab: {
    backgroundColor: '#3B82F6',
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  statItem:   { alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  statLabel:  { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  statDivider:{ width: 1, height: 30, backgroundColor: '#E2E8F0' },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#1E293B' },

  // Filter tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  filterBtn:       { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20, backgroundColor: '#E2E8F0' },
  filterBtnActive: { backgroundColor: '#3B82F6' },
  filterText:      { fontSize: 13, fontWeight: '600', color: '#64748B' },
  filterTextActive:{ color: 'white' },

  // Task card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  cardLeft:        { flexDirection: 'row', alignItems: 'flex-start', flex: 1 },
  cardTextBlock:   { marginLeft: 10, flex: 1 },
  cardTitle:       { fontSize: 15, color: '#1E293B' },
  cardTitleDone:   { textDecorationLine: 'line-through', color: '#94A3B8' },
  cardActions:     { flexDirection: 'row', alignItems: 'center' },
  iconBtn:         { padding: 6, marginLeft: 2 },

  // Priority badge
  badge:     { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyState:     { alignItems: 'center', marginTop: 60 },
  emptyEmoji:     { fontSize: 54, marginBottom: 12 },
  emptyTitle:     { fontSize: 20, fontWeight: '600', color: '#1E293B', marginBottom: 6 },
  emptySubtitle:  { fontSize: 14, color: '#94A3B8', textAlign: 'center', paddingHorizontal: 40 },

  // Edit modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox:     { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
  modalTitle:   { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 16 },
  modalLabel:   { fontSize: 13, fontWeight: '600', color: '#64748B', marginBottom: 8, marginTop: 14 },
  modalInput:   { backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#1E293B' },
  modalActions: { flexDirection: 'row', marginTop: 24, gap: 12 },
  modalBtn:     { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  cancelBtn:    { backgroundColor: '#F1F5F9' },
  cancelBtnText:{ fontWeight: '600', color: '#64748B' },
  saveBtn:      { backgroundColor: '#3B82F6' },
  saveBtnText:  { fontWeight: '600', color: 'white' },

  // Priority selector (in edit modal)
  priorityRow:    { flexDirection: 'row', gap: 8 },
  priorityBtn:    { flex: 1, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, alignItems: 'center' },
  priorityBtnText:{ fontSize: 12, fontWeight: '600' },
});
