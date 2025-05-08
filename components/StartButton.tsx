import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface StartWorkButtonProps {
  offerId: string;
  serviceRequestId: string;
  onPress: () => void;
}

export const StartWorkButton: React.FC<StartWorkButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>Start Work</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#3F63C7",
    paddingVertical: 12,
    borderRadius: 8,
    margin: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
