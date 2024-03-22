import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { Keyboard } from 'react-native';

const ZakatCalculatorScreen: React.FC = () => {
  const [goldGrams, setGoldGrams] = useState<string>('');
  const [silverGrams, setSilverGrams] = useState<string>('');
  const [cashUSD, setCashUSD] = useState<string>('');
  const [investmentUSD, setInvestmentUSD] = useState<string>('');
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [zakatAmount, setZakatAmount] = useState<number>(0);

  const calculateZakat = () => {
    // Calculate total assets
    const totalGoldValue = parseFloat(goldGrams) * GOLD_PRICE_PER_GRAM;
    const totalSilverValue = parseFloat(silverGrams) * SILVER_PRICE_PER_GRAM;
    const totalCashUSD = parseFloat(cashUSD);
    const totalInvestmentUSD = parseFloat(investmentUSD);
    const totalAssetsValue = totalGoldValue + totalSilverValue + totalCashUSD + totalInvestmentUSD;
    setTotalAssets(totalAssetsValue);

    

    // Calculate Zakat amount
    const zakat = totalAssetsValue * ZAKAT_PERCENTAGE;
    setZakatAmount(zakat);

    Keyboard.dismiss();
  
  };

  

  // Constants for prices and zakat percentage
  const GOLD_PRICE_PER_GRAM = 70; // Assume gold price per gram in USD
  const SILVER_PRICE_PER_GRAM = 1; // Assume silver price per gram in USD
  const ZAKAT_PERCENTAGE = 0.025; // 2.5% Zakat percentage

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Zakat Calculator</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gold (grams)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter grams of gold"
          value={goldGrams}
          onChangeText={(text) => setGoldGrams(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Silver (grams)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter grams of silver"
          value={silverGrams}
          onChangeText={(text) => setSilverGrams(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Cash (USD)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter cash in USD"
          value={cashUSD}
          onChangeText={(text) => setCashUSD(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Investment (USD)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter investment in USD"
          value={investmentUSD}
          onChangeText={(text) => setInvestmentUSD(text)}
        />
      </View>
      <Button title="Calculate Zakat" onPress={calculateZakat} />
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Total Assets:</Text>
        <Text style={styles.result}>{`$${totalAssets.toFixed(2)}`}</Text>
      </View>
      <View style={styles.resultContainer}>
        <Text style={styles.resultLabel}>Zakat:</Text>
        <Text style={styles.result}>{`$${zakatAmount.toFixed(2)}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  resultLabel: {
    fontSize: 18,
  },
  result: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ZakatCalculatorScreen;
