import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';

const OTPScreen = () => {
  const [otp, setOtp] = useState('');

  const handleOtpSubmit = () => {
    // Add your OTP validation logic here
    console.log(otp);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={styles.logo}
      />
      {/* <Text style={styles.title}>FirstResQ</Text>
      <Text style={styles.subtitle}>YOUR EMERGENCY PARTNER</Text> */}

      <Text style={styles.otpText}>Enter OTP</Text>
      <Text style={styles.infoText}>An OTP Has Been Sent To 9851349206</Text>

      <View style={styles.otpInputContainer}>
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              keyboardType="numeric"
              maxLength={1}
              onChangeText={(text) => {
                const newOtp = otp.split('');
                newOtp[index] = text;
                setOtp(newOtp.join(''));
              }}
            />
          ))}
      </View>

      <Text style={styles.resendText}>Didn’t Get The Code? <Text style={styles.boldText}>Request Again</Text></Text>

      <TouchableOpacity style={styles.button} onPress={handleOtpSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  otpText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 18,
  },
  resendText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#f44336',
  },
  button: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OTPScreen;
