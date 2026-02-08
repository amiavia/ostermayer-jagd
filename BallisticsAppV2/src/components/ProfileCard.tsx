import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../lib/constants';
import { RifleProfile } from '../types';

interface ProfileCardProps {
  profile: RifleProfile;
  isActive: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProfileCard({ profile, isActive, onSelect, onEdit, onDelete }: ProfileCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.activeContainer]}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={[styles.name, isActive && styles.activeName]}>{profile.name}</Text>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Aktiv</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.caliber}>{profile.caliber}</Text>
        <Text style={styles.ammo}>{profile.ammunition.name}</Text>
      </View>

      <View style={styles.specs}>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>Zero</Text>
          <Text style={styles.specValue}>
            {profile.zeroDistance}m {profile.zeroType === 'gee' ? '(GEE)' : ''}
          </Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>V0</Text>
          <Text style={styles.specValue}>{profile.ammunition.muzzleVelocity} m/s</Text>
        </View>
        <View style={styles.specItem}>
          <Text style={styles.specLabel}>BC ({(profile.dragModel || 'g1').toUpperCase()})</Text>
          <Text style={styles.specValue}>
            {(profile.dragModel || 'g1') === 'g7' && profile.ammunition.bcG7 != null
              ? profile.ammunition.bcG7
              : profile.ammunition.ballisticCoefficient}
          </Text>
        </View>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Text style={styles.actionText}>Bearbeiten</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
              <Text style={[styles.actionText, styles.deleteText]}>Loschen</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warmWhite,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeContainer: {
    borderColor: colors.gold,
    borderWidth: 2,
    backgroundColor: '#FFFDF5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
  },
  activeName: {
    color: colors.forest,
  },
  activeBadge: {
    backgroundColor: colors.gold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.forestDark,
  },
  details: {
    marginBottom: 12,
  },
  caliber: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.forest,
  },
  ammo: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  specs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  specItem: {
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: colors.cream,
  },
  deleteButton: {
    backgroundColor: '#FFF0F0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.forest,
  },
  deleteText: {
    color: colors.error,
  },
});
