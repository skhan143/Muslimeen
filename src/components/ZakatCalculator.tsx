import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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


const ZakatCalculator: React.FC = () => {
  const [goldGrams, setGoldGrams] = useState('');
  const [silverGrams, setSilverGrams] = useState('');
  const [cashUSD, setCashUSD] = useState('');
  const [investmentUSD, setInvestmentUSD] = useState('');
  const [propertyUSD, setPropertyUSD] = useState('');
  const [businessUSD, setBusinessUSD] = useState('');
  const [receivablesUSD, setReceivablesUSD] = useState('');
  const [livestockUSD, setLivestockUSD] = useState('');
  const [totalAssets, setTotalAssets] = useState(0);
  const [zakatAmount, setZakatAmount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [goldPrice, setGoldPrice] = useState('70'); // default $70/g
  const [silverPrice, setSilverPrice] = useState('1'); // default $1/g
  const [errorMsg, setErrorMsg] = useState('');
  const [faqVisible, setFaqVisible] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  // Save calculation to local storage
  const handleSave = async () => {
    try {
      const data = {
        goldGrams, silverGrams, cashUSD, investmentUSD, propertyUSD, businessUSD, receivablesUSD, livestockUSD, totalAssets, zakatAmount, date: new Date().toISOString()
      };
      await AsyncStorage.setItem('zakat_last_calc', JSON.stringify(data));
      setSaveMsg('Calculation saved!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (e) {
      setSaveMsg('Failed to save.');
      setTimeout(() => setSaveMsg(''), 2000);
    }
  };

  // Share calculation result
  const handleShare = async () => {
    try {
      const message = `My Zakat Calculation:\nTotal Assets: $${totalAssets.toFixed(2)}\nZakat Due (2.5%): $${zakatAmount.toFixed(2)}`;
      await Share.share({ message });
    } catch (e) {}
  };

  const ZAKAT_PERCENTAGE = 0.025;



  const validateInput = (value: string): boolean => /^\d*\.?\d*$/.test(value);

  const handleInputChange = (value: string, setter: (value: string) => void) => {
    if (validateInput(value)) setter(value);
  };

  const calculateZakat = () => {
    setErrorMsg('');
    setIsCalculating(true);
    try {
      // Validation: at least one field must be filled
      if (
        !goldGrams && !silverGrams && !cashUSD && !investmentUSD && !propertyUSD && !businessUSD && !receivablesUSD && !livestockUSD
      ) {
        setErrorMsg('Please enter at least one asset value.');
        setIsCalculating(false);
        return;
      }
      const totalGoldValue = parseFloat(goldGrams || '0') * parseFloat(goldPrice || '70');
      const totalSilverValue = parseFloat(silverGrams || '0') * parseFloat(silverPrice || '1');
      const totalCashUSD = parseFloat(cashUSD || '0');
      const totalInvestmentUSD = parseFloat(investmentUSD || '0');
      const totalPropertyUSD = parseFloat(propertyUSD || '0');
      const totalBusinessUSD = parseFloat(businessUSD || '0');
      const totalReceivablesUSD = parseFloat(receivablesUSD || '0');
      const totalLivestockUSD = parseFloat(livestockUSD || '0');
      const totalAssetsValue =
        totalGoldValue +
        totalSilverValue +
        totalCashUSD +
        totalInvestmentUSD +
        totalPropertyUSD +
        totalBusinessUSD +
        totalReceivablesUSD +
        totalLivestockUSD;
      setTotalAssets(totalAssetsValue);
      setZakatAmount(totalAssetsValue * ZAKAT_PERCENTAGE);
      Keyboard.dismiss();
    } catch (error) {
      setErrorMsg('There was an error calculating your Zakat. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const resetCalculator = () => {
    setGoldGrams('');
    setSilverGrams('');
    setCashUSD('');
    setInvestmentUSD('');
    setPropertyUSD('');
    setBusinessUSD('');
    setReceivablesUSD('');
    setLivestockUSD('');
    setTotalAssets(0);
    setZakatAmount(0);
    setErrorMsg('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <LinearGradient
        colors={["#eaf6fb", "#ffffff", "#368a95"]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.heading}>Zakat Calculator</Text>
            <Text style={styles.subheading}>Calculate your annual Zakat based on your assets</Text>
          </View>
          {/* Gold */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Gold (grams)
              <TouchableOpacity onPress={() => Alert.alert('Gold', 'Enter the total grams of gold you own. Zakat is due if it meets the Nisab.')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
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
              <Text style={{ fontSize: 12, color: theme.textLight, marginLeft: 6 }}>/g</Text>
            </View>
            <View style={[styles.inputWrapper, { marginTop: 6 }]}> 
              <Ionicons name="pricetag-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Gold price per gram (USD)"
                value={goldPrice}
                onChangeText={(value) => handleInputChange(value, setGoldPrice)}
                placeholderTextColor={theme.textLight}
              />
              <Text style={{ fontSize: 12, color: theme.textLight, marginLeft: 6 }}>$ /g</Text>
            </View>
          </View>
          {/* Silver */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Silver (grams)
              <TouchableOpacity onPress={() => Alert.alert('Silver', 'Enter the total grams of silver you own. Zakat is due if it meets the Nisab.')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
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
              <Text style={{ fontSize: 12, color: theme.textLight, marginLeft: 6 }}>/g</Text>
            </View>
            <View style={[styles.inputWrapper, { marginTop: 6 }]}> 
              <Ionicons name="pricetag-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Silver price per gram (USD)"
                value={silverPrice}
                onChangeText={(value) => handleInputChange(value, setSilverPrice)}
                placeholderTextColor={theme.textLight}
              />
              <Text style={{ fontSize: 12, color: theme.textLight, marginLeft: 6 }}>$ /g</Text>
            </View>
          </View>
          {/* Cash */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cash (USD)
              <TouchableOpacity onPress={() => Alert.alert('Cash', 'Include all cash in hand, bank, or digital wallets.')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
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
          {/* Investments */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Investments (e.g., stocks, savings, etc.)
              <TouchableOpacity onPress={() => Alert.alert('Investments', 'Include stocks, savings, mutual funds, and other zakatable investments.')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="trending-up-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter investments in USD"
                value={investmentUSD}
                onChangeText={(value) => handleInputChange(value, setInvestmentUSD)}
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>
          {/* Property */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Property (USD)
              <TouchableOpacity onPress={() => Alert.alert('Property', 'Include only property held for resale or investment, not your primary residence.')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="home-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter property value in USD"
                value={propertyUSD}
                onChangeText={(value) => handleInputChange(value, setPropertyUSD)}
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>
          {/* Business Inventory */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Business Inventory (USD)
              <TouchableOpacity onPress={() => Alert.alert('Business Inventory', 'Include the value of goods for sale or trade at year end.')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter inventory value in USD"
                value={businessUSD}
                onChangeText={(value) => handleInputChange(value, setBusinessUSD)}
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>
          {/* Receivables */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Receivables (USD)
              <TouchableOpacity onPress={() => Alert.alert('Receivables', 'Include money owed to you that you expect to receive.')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="receipt-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter receivables in USD"
                value={receivablesUSD}
                onChangeText={(value) => handleInputChange(value, setReceivablesUSD)}
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>
          {/* Livestock */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Livestock (USD)
              <TouchableOpacity onPress={() => Alert.alert('Livestock', 'Include the value of zakatable livestock (e.g., camels, cows, sheep).')}
                style={{ marginLeft: 4 }}>
                <Ionicons name="information-circle-outline" size={16} color={theme.textLight} />
              </TouchableOpacity>
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="paw-outline" size={20} color={theme.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter livestock value in USD"
                value={livestockUSD}
                onChangeText={(value) => handleInputChange(value, setLivestockUSD)}
                placeholderTextColor={theme.textLight}
              />
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={calculateZakat} disabled={isCalculating}>
              <LinearGradient
                colors={["#00515f", "#368a95"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ ...StyleSheet.absoluteFillObject, borderRadius: 8 }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
                {isCalculating ? (
                  <ActivityIndicator color={theme.white} />
                ) : (
                  <>
                    <Ionicons name="calculator-outline" size={20} color={theme.white} style={styles.buttonIcon} />
                    <Text style={styles.buttonText}>Calculate Zakat</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={resetCalculator}>
              <LinearGradient
                colors={["#f7e8a4", "#ffd700"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ ...StyleSheet.absoluteFillObject, borderRadius: 8 }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', zIndex: 1 }}>
                <Ionicons name="refresh-outline" size={20} color={theme.text} style={styles.buttonIcon} />
                <Text style={[styles.buttonText, { color: theme.text }]}>Reset</Text>
              </View>
            </TouchableOpacity>
          </View>
          {errorMsg ? (
            <Text style={{ color: theme.accent, textAlign: 'center', marginBottom: 10 }}>{errorMsg}</Text>
          ) : null}
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
          {/* Save/Share/Export/Learn More Buttons */}
          {(totalAssets > 0 || zakatAmount > 0) && (
            <View style={{ marginTop: 18, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary, marginHorizontal: 2, paddingVertical: 10 }]} onPress={handleSave}>
                <Ionicons name="save-outline" size={20} color={theme.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.secondary, marginHorizontal: 2, paddingVertical: 10 }]} onPress={handleShare}>
                <Ionicons name="share-social-outline" size={20} color={theme.white} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
              {/* PDF Export button can be added here using expo-print or react-native-print */}
            </View>
          )}
          {saveMsg ? <Text style={{ color: theme.secondary, textAlign: 'center', marginBottom: 6 }}>{saveMsg}</Text> : null}
          {/* Learn More / FAQ Button */}
          <TouchableOpacity style={{ alignSelf: 'center', marginTop: 10, marginBottom: 30 }} onPress={() => setFaqVisible(true)}>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}><Ionicons name="help-circle-outline" size={18} color={theme.primary} /> Learn More / Zakat FAQs</Text>
          </TouchableOpacity>
          {/* FAQ Modal */}
          <Modal
            visible={faqVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setFaqVisible(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: theme.white, borderRadius: 18, padding: 24, width: '90%', maxHeight: '80%' }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.primary, marginBottom: 10, textAlign: 'center' }}>Zakat FAQs & Guidance</Text>
                <ScrollView style={{ maxHeight: 350 }}>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>What is Zakat?</Text>
                  <Text style={{ marginBottom: 10 }}>Zakat is an obligatory charity (2.5% of wealth) for eligible Muslims, due annually on savings/assets above the Nisab threshold.</Text>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>What assets are zakatable?</Text>
                  <Text style={{ marginBottom: 10 }}>Gold, silver, cash, business inventory, investments, property for resale, receivables, and livestock. Personal items and primary residence are not zakatable.</Text>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>What is Nisab?</Text>
                  <Text style={{ marginBottom: 10 }}>Nisab is the minimum wealth threshold for Zakat to be obligatory. It is equal to the value of 87.48g gold or 612.36g silver.</Text>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>When is Zakat due?</Text>
                  <Text style={{ marginBottom: 10 }}>Once a lunar year passes while your wealth remains above Nisab, Zakat is due.</Text>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>References</Text>
                  <Text style={{ marginBottom: 10 }}>
                    - Quran 9:60, 2:267-273{"\n"}
                    - Sahih Bukhari, Book 24
                    - Scholarly consensus (Ijma)
                  </Text>
                  <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>More info:</Text>
                  <Text style={{ color: theme.primary }} onPress={() => {}}>https://www.islamic-relief.org/zakat/</Text>
                </ScrollView>
                <Pressable onPress={() => setFaqVisible(false)} style={{ marginTop: 18, alignSelf: 'center' }}>
                  <Text style={{ color: theme.accent, fontWeight: 'bold', fontSize: 16 }}>Close</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </LinearGradient>
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

export default ZakatCalculator;
