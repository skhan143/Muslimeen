import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Theme colors (matching App.tsx)
const theme = {
  primary: '#3498db',
  secondary: '#2ecc71',
  accent: '#e74c3c',
  background: '#f8f9fa',
  text: '#2c3e50',
  textLight: '#7f8c8d',
  white: '#ffffff',
  border: '#e0e0e0',
  shadow: '#000000',
};

const ZakatCalculatorScreen: React.FC = () => {
  const [goldGrams, setGoldGrams] = useState<string>('');
  const [silverGrams, setSilverGrams] = useState<string>('');
  const [cashUSD, setCashUSD] = useState<string>('');
  const [investmentUSD, setInvestmentUSD] = useState<string>('');
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [zakatAmount, setZakatAmount] = useState<number>(0);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Constants for prices and zakat percentage
  const GOLD_PRICE_PER_GRAM = 70; // Assume gold price per gram in USD
  const SILVER_PRICE_PER_GRAM = 1; // Assume silver price per gram in USD
  const ZAKAT_PERCENTAGE = 0.025; // 2.5% Zakat percentage

  const validateInput = (value: string): boolean => {
    return /^\d*\.?\d*$/.test(value);
  };

  const handleInputChange = (value: string, setter: (value: string) => void) => {
    if (validateInput(value)) {
      setter(value);
    }
  };

  const calculateZakat = () => {
    setIsCalculating(true);

    try {
      // Calculate total assets
      const totalGoldValue = parseFloat(goldGrams || '0') * GOLD_PRICE_PER_GRAM;
      const totalSilverValue = parseFloat(silverGrams || '0') * SILVER_PRICE_PER_GRAM;
      const totalCashUSD = parseFloat(cashUSD || '0');
      const totalInvestmentUSD = parseFloat(investmentUSD || '0');
      const totalAssetsValue = totalGoldValue + totalSilverValue + totalCashUSD + totalInvestmentUSD;
      
      setTotalAssets(totalAssetsValue);

      // Calculate Zakat amount
      const zakat = totalAssetsValue * ZAKAT_PERCENTAGE;
      setZakatAmount(zakat);

      Keyboard.dismiss();
    } catch (error) {
      Alert.alert(
        'Calculation Error',
        'There was an error calculating your Zakat. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const resetCalculator = () => {
    setGoldGrams('');
    setSilverGrams('');
    setCashUSD('');
    setInvestmentUSD('');
    setTotalAssets(0);
    setZakatAmount(0);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.heading}>Zakat Calculator</Text>
          <Text style={styles.subheading}>Calculate your annual Zakat based on your assets</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gold (grams)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="logo-bitcoin" size={20} color={theme.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter grams of gold"
              value={goldGrams}
              onChangeText={(value) => handleInputChange(value, setGoldGrams)}
              placeholderTextColor={theme.textLight}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Silver (grams)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="logo-bitcoin" size={20} color={theme.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter grams of silver"
              value={silverGrams}
              onChangeText={(value) => handleInputChange(value, setSilverGrams)}
              placeholderTextColor={theme.textLight}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Cash (USD)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="cash-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter cash in USD"
              value={cashUSD}
              onChangeText={(value) => handleInputChange(value, setCashUSD)}
              placeholderTextColor={theme.textLight}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Investment (USD)</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="trending-up-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter investment in USD"
              value={investmentUSD}
              onChangeText={(value) => handleInputChange(value, setInvestmentUSD)}
              placeholderTextColor={theme.textLight}
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.calculateButton]}
            onPress={calculateZakat}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <ActivityIndicator color={theme.white} />
            ) : (
              <>
                <Ionicons name="calculator-outline" size={20} color={theme.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Calculate Zakat</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.resetButton]}
            onPress={resetCalculator}
          >
            <Ionicons name="refresh-outline" size={20} color={theme.white} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {(totalAssets > 0 || zakatAmount > 0) && (
          <View style={styles.resultContainer}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Total Assets:</Text>
              <Text style={styles.resultValue}>{`$${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Zakat Amount (2.5%):</Text>
              <Text style={[styles.resultValue, styles.zakatAmount]}>{`$${zakatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 16,
    color: theme.textLight,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: theme.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  calculateButton: {
    backgroundColor: theme.primary,
  },
  resetButton: {
    backgroundColor: theme.accent,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: theme.white,
    borderRadius: 8,
    padding: 20,
    elevation: 2,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: theme.text,
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    color: theme.primary,
    fontWeight: 'bold',
  },
  zakatAmount: {
    color: theme.secondary,
    fontSize: 20,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 10,
  },
});

export default ZakatCalculatorScreen;
