import { StyleSheet } from "react-native";
import { Colors } from "./Colors";

export function createStyles() {
  return StyleSheet.create({
    body: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    container: {
      paddingVertical: 5,
      paddingHorizontal: 16,
      justifyContent: 'space-between',
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      paddingVertical: 16,
      marginBottom: 30,
    },
    progressContainer: {
      alignItems: 'center',
    },
    progressOuter: {
      width: 40,
      height: 180,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: Colors.text,
      overflow: 'hidden',
      backgroundColor: Colors.background,
      justifyContent: 'flex-end',
    },
    progressInner: {
      backgroundColor: Colors.primary,
      width: '100%',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
    },
    percentageText: {
      color: Colors.primary,
      fontSize: 20,
      fontWeight: '600',
      marginTop: 8,
    },
    statsBox: {
      gap: 6,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
    },
    label: {
      fontSize: 16,
      color: Colors.text,
    },
    value: {
      fontWeight: '500',
    },
    statusText: {
      fontSize: 16,
      marginTop: 6,
    },
    measurementsList: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    tableWrapper: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    tableTitle: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: 15,
      textAlign: 'left',
    },
    table: {
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: Colors.tableBorder,
      borderRadius: 8,
      overflow: 'hidden',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: Colors.tableBorder,
    },
    tableCell: {
      flex: 1,
      padding: 8,
      fontSize: 15,
    },
    tableHeader: {
      fontWeight: 'bold',
      backgroundColor: Colors.tableHeader,
    },
    testRowBackground: {
      backgroundColor: Colors.tableBorder,
    },
    button: {
      backgroundColor: Colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      alignItems: "center",
      marginTop: 5,
      marginBottom: 20,
      shadowColor: Colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
    },
    buttonText: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
    input: {
      height: 48,
      borderColor: "#999",
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
      fontSize: 16,
      backgroundColor: "#fff",
      color: "#000",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    notFoundContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: Colors.background,
    },
    notFoundLink: {
      marginTop: 15,
      paddingVertical: 15,
    },
    headerImage: {
      bottom: -90,
      left: -35,
      position: 'absolute',
    },
    titleContainer: {
      flexDirection: 'row',
      gap: 8,
    },
  });
}
