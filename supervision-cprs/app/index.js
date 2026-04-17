import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useSupervision } from '../src/context/SupervisionContext';
import { useAuth } from '../src/context/AuthContext';
import { useSync } from '../src/context/SyncProvider';
import { COLORS, SIZES, SHADOWS } from '../src/constants/theme';
import { formatearFechaDisplay } from '../src/utils/dateUtils';
import { supabaseEstaConfigurado } from '../src/config/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const {
    supervisiones,
    cargarSupervisiones,
    nuevaSupervision,
    eliminarSupervision,
    cargando
  } = useSupervision();
  const { usuario, cerrarSesion } = useAuth();
  const { online, pendientes, drenarCola } = useSync();

  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await cerrarSesion();
            router.replace('/login');
          },
        },
      ]
    );
  };

  useEffect(() => {
    cargarSupervisiones();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await cargarSupervisiones();
    setRefreshing(false);
  }, [cargarSupervisiones]);

  const handleNuevaSupervision = () => {
    nuevaSupervision();
    router.push('/datos-generales');
  };

  const handleContinuarSupervision = (supervision) => {
    router.push({
      pathname: '/datos-generales',
      params: { id: supervision.id }
    });
  };

  const handleVerSupervision = (supervision) => {
    router.push({
      pathname: '/vista-previa',
      params: { id: supervision.id }
    });
  };

  const handleEliminar = (supervision) => {
    Alert.alert(
      '🗑️ Eliminar supervisión',
      `¿Estás seguro de eliminar la supervisión de "${supervision.datosGenerales?.nombreCprs || 'Sin nombre'}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            await eliminarSupervision(supervision.id);
            await cargarSupervisiones();
          }
        },
      ]
    );
  };

  const renderSupervision = ({ item, index }) => {
    const esBorrador = item.estado === 'borrador';
    const nombreCprs = item.datosGenerales?.nombreCprs || 'Sin nombre';
    const numAreas = item.areas?.length || 0;
    const numFotos = item.areas?.reduce((acc, area) => acc + (area.fotos?.length || 0), 0) || 0;
    
    return (
      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={styles.supervisionCard}
          onPress={() => esBorrador ? handleContinuarSupervision(item) : handleVerSupervision(item)}
          activeOpacity={0.95}
        >
          {/* Indicador lateral de estado */}
          <View style={[
            styles.cardIndicator,
            esBorrador ? styles.indicatorBorrador : styles.indicatorFinalizado
          ]} />
          
          <View style={styles.cardContent}>
            {/* Header con nombre y badge */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleSection}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {nombreCprs}
                </Text>
                <View style={[
                  styles.estadoBadge,
                  esBorrador ? styles.estadoBorrador : styles.estadoFinalizado
                ]}>
                  <View style={[styles.badgeDot, esBorrador ? styles.dotBorrador : styles.dotFinalizado]} />
                  <Text style={[styles.estadoText, esBorrador ? styles.textBorrador : styles.textFinalizado]}>
                    {esBorrador ? 'Borrador' : 'Listo'}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Info de fecha */}
            <View style={styles.cardMeta}>
              <View style={styles.metaItem}>
                <Text style={styles.metaIcon}>📅</Text>
                <Text style={styles.metaText}>
                  {formatearFechaDisplay(item.datosGenerales?.fechaHoraSupervision || item.fechaCreacion)}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>📍</Text>
                </View>
                <Text style={styles.statNumber}>{numAreas}</Text>
                <Text style={styles.statLabel}>Área{numAreas !== 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={styles.statIconContainer}>
                  <Text style={styles.statIcon}>📷</Text>
                </View>
                <Text style={styles.statNumber}>{numFotos}</Text>
                <Text style={styles.statLabel}>Foto{numFotos !== 1 ? 's' : ''}</Text>
              </View>
            </View>
            
            {/* Acciones */}
            <View style={styles.cardActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => esBorrador ? handleContinuarSupervision(item) : handleVerSupervision(item)}
              >
                <Text style={styles.actionButtonText}>
                  {esBorrador ? 'Continuar editando →' : 'Ver detalles →'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleEliminar(item)}
              >
                <Text style={styles.deleteButtonIcon}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Text style={styles.emptyIcon}>📋</Text>
      </View>
      <Text style={styles.emptyTitle}>Sin supervisiones</Text>
      <Text style={styles.emptySubtitle}>
        Presiona el botón inferior para crear tu primera supervisión de C.P.R.S.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>Supervisiones recientes</Text>
      <Text style={styles.listHeaderCount}>{supervisiones.length} registro{supervisiones.length !== 1 ? 's' : ''}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header con gradiente */}
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, COLORS.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>CPRS</Text>
            </View>
            {supabaseEstaConfigurado() && usuario && (
              <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Text style={styles.logoutBtnText}>Salir  ⎋</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.headerTitle}>Supervisión</Text>
          <Text style={styles.headerSubtitle}>
            {usuario?.email ? usuario.email : 'Sistema de gestión de supervisiones'}
          </Text>

          {supabaseEstaConfigurado() && (
            <View style={styles.syncRow}>
              <View style={[styles.syncDot, { backgroundColor: online ? '#7CB342' : '#F9A825' }]} />
              <Text style={styles.syncText}>
                {online ? 'En línea' : 'Sin conexión'}
              </Text>
              {pendientes > 0 && (
                <TouchableOpacity style={styles.syncPending} onPress={drenarCola}>
                  <Text style={styles.syncPendingText}>
                    ⏳ {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        
        {/* Decoración */}
        <View style={styles.headerDecoration}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>
      </LinearGradient>

      {/* Lista de supervisiones */}
      <FlatList
        data={supervisiones}
        keyExtractor={(item) => item.id}
        renderItem={renderSupervision}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        ListHeaderComponent={supervisiones.length > 0 ? renderHeader : null}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || cargando}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            progressBackgroundColor={COLORS.white}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Botón flotante nueva supervisión */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleNuevaSupervision}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.fabGradient}
          >
            <Text style={styles.fabIcon}>+</Text>
            <Text style={styles.fabText}>Nueva Supervisión</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  // Header
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: SIZES.paddingLarge,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerContent: {
    zIndex: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutBtn: {
    backgroundColor: COLORS.white + '25',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  logoutBtnText: {
    color: COLORS.white,
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  headerBadge: {
    backgroundColor: COLORS.secondary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  headerBadgeText: {
    color: COLORS.primaryDark,
    fontSize: SIZES.xs,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.white,
    opacity: 0.85,
    marginTop: 6,
    fontWeight: '400',
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
    flexWrap: 'wrap',
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  syncText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
    marginRight: 4,
  },
  syncPending: {
    backgroundColor: COLORS.warning + '50',
    borderWidth: 1,
    borderColor: COLORS.warning,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  syncPendingText: {
    color: COLORS.white,
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 200,
  },
  decorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.white,
    opacity: 0.05,
    top: -30,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.secondary,
    opacity: 0.15,
    top: 60,
    right: 40,
  },
  
  // Lista
  listContainer: {
    padding: SIZES.padding,
    paddingTop: 20,
    paddingBottom: 120,
    flexGrow: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  listHeaderTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  listHeaderCount: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  // Cards
  cardWrapper: {
    marginBottom: 16,
  },
  supervisionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardIndicator: {
    width: 5,
  },
  indicatorBorrador: {
    backgroundColor: COLORS.warning,
  },
  indicatorFinalizado: {
    backgroundColor: COLORS.success,
  },
  cardContent: {
    flex: 1,
    padding: 18,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  estadoBorrador: {
    backgroundColor: '#FFF3E0',
  },
  estadoFinalizado: {
    backgroundColor: '#E8F5E9',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  dotBorrador: {
    backgroundColor: COLORS.warning,
  },
  dotFinalizado: {
    backgroundColor: COLORS.success,
  },
  estadoText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  textBorrador: {
    color: '#E65100',
  },
  textFinalizado: {
    color: COLORS.success,
  },
  
  // Meta info
  cardMeta: {
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  metaText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.primary + '20',
    marginHorizontal: 10,
  },
  statIconContainer: {
    marginBottom: 4,
  },
  statIcon: {
    fontSize: 18,
  },
  statNumber: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  
  // Actions
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary + '10',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginRight: 10,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.error + '10',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonIcon: {
    fontSize: 18,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: SIZES.padding,
    right: SIZES.padding,
  },
  fab: {
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  fabIcon: {
    fontSize: 24,
    color: COLORS.white,
    marginRight: 10,
    fontWeight: '300',
  },
  fabText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
});
