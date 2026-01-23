import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Card } from '../../src/components';
import { colors } from '../../src/lib/constants';
import { useApp } from '../../src/context/AppContext';
import { clearAllData } from '../../src/lib/storage';

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();

  const unitOptions = [
    { value: 'cm', label: 'Zentimeter (cm)' },
    { value: 'moa', label: 'MOA' },
    { value: 'mil', label: 'MIL/MRAD' },
  ] as const;

  const handleUnitChange = (unit: 'cm' | 'moa' | 'mil') => {
    updateSettings({ units: unit });
  };

  const handleResetData = () => {
    Alert.alert(
      'Alle Daten loschen',
      'Mochten Sie wirklich alle Profile und Einstellungen loschen? Diese Aktion kann nicht ruckgangig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Loschen',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Alert.alert('Erfolg', 'Alle Daten wurden geloscht. Bitte starten Sie die App neu.');
            } catch (error) {
              Alert.alert('Fehler', 'Daten konnten nicht geloscht werden');
            }
          },
        },
      ]
    );
  };

  const handleOpenWebsite = () => {
    Linking.openURL('https://ostermayer-jagd.com');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Einstellungen" />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Unit Selection */}
        <Text style={styles.sectionTitle}>Einheiten</Text>
        <Card style={styles.settingsCard}>
          {unitOptions.map(option => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionRow,
                settings.units === option.value && styles.optionRowSelected,
              ]}
              onPress={() => handleUnitChange(option.value)}
            >
              <Text style={[
                styles.optionLabel,
                settings.units === option.value && styles.optionLabelSelected,
              ]}>
                {option.label}
              </Text>
              {settings.units === option.value && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Info Section */}
        <Text style={styles.sectionTitle}>Uber die App</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ballistik-Modell</Text>
            <Text style={styles.infoValue}>G1 Drag Model</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Daten verifiziert</Text>
            <Text style={styles.infoValue}>Januar 2025</Text>
          </View>
        </Card>

        {/* Data Sources Section */}
        <Text style={styles.sectionTitle}>Datenquellen & Methodik</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.dataSourceSection}>
            <Text style={styles.dataSourceTitle}>Ballistisches Berechnungsmodell</Text>
            <Text style={styles.dataSourceText}>
              Diese App verwendet das G1 Standard-Widerstandsmodell mit numerischer Integration (Punkt-Masse-Trajektorienberechnung). Die Berechnung berucksichtigt:
            </Text>
            <Text style={styles.dataSourceBullet}>• Schwerkraft (9.81 m/s²)</Text>
            <Text style={styles.dataSourceBullet}>• Luftwiderstand nach G1-Modell</Text>
            <Text style={styles.dataSourceBullet}>• Luftdichte (Temperatur, Druck)</Text>
            <Text style={styles.dataSourceBullet}>• Windabdrift (Querwind)</Text>
            <Text style={styles.dataSourceBullet}>• Zielfernrohrhohe uber Lauf</Text>
          </View>

          <View style={styles.dividerFull} />

          <View style={styles.dataSourceSection}>
            <Text style={styles.dataSourceTitle}>Berechnungsmethodik je Metrik</Text>

            <View style={styles.metricItem}>
              <Text style={styles.metricName}>Haltepunkt (Drop)</Text>
              <Text style={styles.metricFormula}>Position = Anfangshohe + ∫∫(Beschleunigung) dt²</Text>
              <Text style={styles.metricDescription}>
                Vertikale Abweichung vom Zielpunkt. Berechnet durch numerische Integration der Flugbahn unter Berucksichtigung von Schwerkraft (g = 9.81 m/s²), Luftwiderstand und Einschusswinkel. Positiv (+) = uber Zielpunkt, Negativ (-) = unter Zielpunkt.
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricName}>Windabdrift</Text>
              <Text style={styles.metricFormula}>Drift = ∫(Windkraft × dt)</Text>
              <Text style={styles.metricDescription}>
                Seitliche Abweichung durch Querwind. Windkomponente = Windgeschwindigkeit × sin(Windwinkel). Positiv (+) = Abdrift nach rechts, Negativ (-) = Abdrift nach links.
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricName}>Flugzeit</Text>
              <Text style={styles.metricFormula}>t = ∑(Δt) bis Zieldistanz erreicht</Text>
              <Text style={styles.metricDescription}>
                Gesamtzeit vom Verlassen des Laufs bis zum Erreichen der Zieldistanz. Berechnet in 1ms-Schritten durch numerische Integration.
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricName}>V @ Ziel (Geschwindigkeit)</Text>
              <Text style={styles.metricFormula}>v = √(vx² + vy²)</Text>
              <Text style={styles.metricDescription}>
                Restgeschwindigkeit bei Zieldistanz. Berechnet aus horizontaler (vx) und vertikaler (vy) Geschwindigkeitskomponente nach Abbremsung durch Luftwiderstand.
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricName}>Energie</Text>
              <Text style={styles.metricFormula}>E = ½ × m × v²</Text>
              <Text style={styles.metricDescription}>
                Kinetische Energie des Geschosses bei Zieldistanz in Joule. m = Geschossgewicht (grain × 0.0000648 kg), v = Restgeschwindigkeit in m/s.
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricName}>G1 Widerstandsberechnung</Text>
              <Text style={styles.metricFormula}>a = K × (ρ/ρ₀) × (Cd/BC) × v²</Text>
              <Text style={styles.metricDescription}>
                Abbremsung durch Luftwiderstand. K = 0.000871 (G1-Konstante), ρ = aktuelle Luftdichte, ρ₀ = 1.225 kg/m³ (Standardatmosphare), Cd = G1-Widerstandsbeiwert (Mach-abhangig aus JBM-Tabelle), BC = ballistischer Koeffizient.
              </Text>
            </View>
          </View>

          <View style={styles.dividerFull} />

          <View style={styles.dataSourceSection}>
            <Text style={styles.dataSourceTitle}>Munitionsdaten - Primare Quellen</Text>
            <Text style={styles.dataSourceText}>
              Alle ballistischen Koeffizienten (BC) und Mundungsgeschwindigkeiten stammen aus offiziellen Herstellerangaben:
            </Text>

            <View style={styles.sourceItem}>
              <Text style={styles.sourceName}>Hornady Manufacturing, Inc.</Text>
              <Text style={styles.sourceUrl}>hornady.com/ammunition</Text>
              <Text style={styles.sourceDetail}>BC (G1), V0 aus Produktdatenblattern</Text>
              <Text style={styles.sourceDetail}>Testlauflange: 24 Zoll (610 mm)</Text>
            </View>

            <View style={styles.sourceItem}>
              <Text style={styles.sourceName}>Federal Premium Ammunition</Text>
              <Text style={styles.sourceUrl}>federalpremium.com/ballistics</Text>
              <Text style={styles.sourceDetail}>Fusion, Premium Produktlinien</Text>
              <Text style={styles.sourceDetail}>Testlauflange: 24 Zoll (610 mm)</Text>
            </View>

            <View style={styles.sourceItem}>
              <Text style={styles.sourceName}>Norma Precision AB</Text>
              <Text style={styles.sourceUrl}>norma.cc/ammunition</Text>
              <Text style={styles.sourceDetail}>Europaische Kaliber (9.3x62, 8x57 IS)</Text>
              <Text style={styles.sourceDetail}>Oryx, Tipstrike Produktlinien</Text>
            </View>

            <View style={styles.sourceItem}>
              <Text style={styles.sourceName}>RWS (RUAG Ammotec)</Text>
              <Text style={styles.sourceUrl}>rws-ammunition.com</Text>
              <Text style={styles.sourceDetail}>Deutsche Jagdmunition</Text>
              <Text style={styles.sourceDetail}>HIT, ID Classic Produktlinien</Text>
            </View>
          </View>

          <View style={styles.dividerFull} />

          <View style={styles.dataSourceSection}>
            <Text style={styles.dataSourceTitle}>Referenzwerke & Validierung</Text>
            <View style={styles.sourceItem}>
              <Text style={styles.sourceName}>Bryan Litz - Applied Ballistics</Text>
              <Text style={styles.sourceDetail}>Ballistik-Standardwerk fur BC-Messungen</Text>
            </View>
            <View style={styles.sourceItem}>
              <Text style={styles.sourceName}>JBM Ballistics Calculator</Text>
              <Text style={styles.sourceUrl}>jbmballistics.com</Text>
              <Text style={styles.sourceDetail}>Validierung der Trajektorienberechnungen</Text>
            </View>
          </View>

          <View style={styles.dividerFull} />

          <View style={styles.dataSourceSection}>
            <Text style={styles.dataSourceTitle}>Wichtige Hinweise</Text>
            <Text style={styles.warningText}>
              Die angegebenen Werte sind Durchschnittswerte unter Standardbedingungen (ICAO Standardatmosphare: 15°C, 1013.25 hPa, Meereshohe).
            </Text>
            <Text style={styles.warningText}>
              Tatsachliche Leistung kann variieren durch: Lauflange, Umgebungstemperatur, Hohe uber NN, Luftfeuchtigkeit, individuelle Waffencharakteristiken.
            </Text>
            <Text style={styles.warningText}>
              Alle Schussweiten sollten vor der Jagd am eigenen Gewehr uberpruft werden. Diese App dient als Berechnungshilfe, nicht als Ersatz fur praktisches Einschiessen.
            </Text>
          </View>
        </Card>

        {/* Ostermayer Info */}
        <Text style={styles.sectionTitle}>Ostermayer AG</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.linkRow} onPress={handleOpenWebsite}>
            <Text style={styles.linkLabel}>Website besuchen</Text>
            <Text style={styles.linkIcon}>→</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutText}>
              Premium Jagd seit 2019. Qualitat und Tradition vereint.
            </Text>
          </View>
        </Card>

        {/* Danger Zone */}
        <Text style={styles.sectionTitle}>Gefahrenzone</Text>
        <Card style={[styles.settingsCard, styles.dangerCard]}>
          <TouchableOpacity style={styles.dangerRow} onPress={handleResetData}>
            <Text style={styles.dangerLabel}>Alle Daten loschen</Text>
            <Text style={styles.dangerDescription}>
              Loscht alle Profile und Einstellungen
            </Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionRowSelected: {
    backgroundColor: '#FFFDF5',
  },
  optionLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  optionLabelSelected: {
    fontWeight: '600',
    color: colors.forest,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: colors.forestDark,
    fontWeight: '700',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  infoValue: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  linkLabel: {
    fontSize: 16,
    color: colors.forest,
    fontWeight: '500',
  },
  linkIcon: {
    fontSize: 18,
    color: colors.forest,
  },
  aboutRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  dangerCard: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  dangerRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dangerLabel: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
    marginBottom: 4,
  },
  dangerDescription: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 24,
  },
  dataSourceSection: {
    padding: 16,
  },
  dataSourceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.forest,
    marginBottom: 8,
  },
  dataSourceText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  dataSourceBullet: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 8,
  },
  dividerFull: {
    height: 1,
    backgroundColor: colors.border,
  },
  sourceItem: {
    marginTop: 12,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sourceUrl: {
    fontSize: 12,
    color: colors.forest,
    marginTop: 2,
  },
  sourceDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  warningText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
    fontStyle: 'italic',
  },
  metricItem: {
    marginTop: 16,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: colors.forest,
  },
  metricName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricFormula: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.forest,
    backgroundColor: colors.cream,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  metricDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 4,
  },
});
