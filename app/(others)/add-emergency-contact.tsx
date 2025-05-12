import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useThemeStore } from "@/store/themeStore";
import { lightTheme, darkTheme } from "@/constants/theme";
import { createEmergencyContact } from "@/services/api/emergency-contacts";
import { useAuthStore } from "@/store/authStore"; // Import auth store for error handling

const AddEmergencyContactScreen = () => {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { error, clearError } = useAuthStore(); // Use auth store error handling
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCommanContact, setIsCommanContact] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.length > 50) {
      newErrors.name = "Name must be less than 50 characters";
    }

    if (!relationship.trim()) {
      newErrors.relationship = "Relationship is required";
    } else if (relationship.length > 50) {
      newErrors.relationship = "Relationship must be less than 50 characters";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10,15}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number (10-15 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    clearError();

    try {
      await createEmergencyContact({
        name,
        phoneNumber,
        isCommanContact,
        relationship,
      });

      router.back();
    } catch (error: any) {
      console.error("Error adding emergency contact:", {
        error,
        message: error?.message,
        response: error?.response?.data,
      });
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Failed to add emergency contact"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <LinearGradient colors={[theme.background, theme.surface]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerText, { color: theme.text }]}>Add Emergency Contact</Text>
          <Text style={[styles.headerSubtext, { color: theme.textSecondary }]}>
            Add a new emergency contact
          </Text>
        </LinearGradient>

        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Name</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
              <Icon name="user" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter name"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={setName}
                maxLength={50}
                editable={!isLoading}
              />
            </View>
            {errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>}
          </View>

          {/* Relationship Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Relationship</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
              <Icon name="users" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter relationship"
                placeholderTextColor={theme.textSecondary}
                value={relationship}
                onChangeText={setRelationship}
                maxLength={50}
                editable={!isLoading}
              />
            </View>
            {errors.relationship && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.relationship}</Text>
            )}
          </View>

          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
            <View style={[styles.inputWrapper, { backgroundColor: theme.surface }]}>
              <Icon name="phone" size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Enter phone number"
                placeholderTextColor={theme.textSecondary}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
                maxLength={15}
                editable={!isLoading}
              />
            </View>
            {errors.phoneNumber && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.phoneNumber}</Text>
            )}
          </View>

          {/* Common Contact Switch */}
          <View style={styles.switchContainer}>
            <Text style={[styles.switchLabel, { color: theme.text }]}>Common Contact</Text>
            <Switch
              value={isCommanContact}
              onValueChange={setIsCommanContact}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isCommanContact ? "#fff" : theme.textSecondary}
              disabled={isLoading}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.primary },
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Add Contact</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  header: {
    padding: 15,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: { position: "absolute", left: 15, top: 15 },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    paddingLeft: 40,
  },
  headerSubtext: {
    fontSize: 14,
    textAlign: "left",
    paddingLeft: 40,
    marginTop: 5,
  },
  formContainer: { padding: 20 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  errorText: { fontSize: 12, marginTop: 4 },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  switchLabel: { fontSize: 16, fontWeight: "600" },
  submitButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

export default AddEmergencyContactScreen;