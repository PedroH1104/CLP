import React, { JSX } from 'react';
import { ScrollView, View, Text, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type PageStructureProps = {
    title: string;
    icon: string;
    children: React.ReactNode;
    refreshControl?: JSX.Element; // Parâmetro opcional adicionado
};

export default function PageStructure({ title, icon, children, refreshControl }: PageStructureProps) {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.header}>
                    <Ionicons name={icon} size={30} color="#003366" style={styles.icon} />
                    <Text style={styles.title}>{title}</Text>
                </View>
            <ScrollView contentContainerStyle={styles.scrollView} refreshControl={refreshControl} >                
                <View style={styles.content}>
                    {children}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 50, 
    },
    scrollView: {
               
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',       
        marginBottom: 30,
        marginLeft: 20,
    },
    icon: {
        marginRight: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#003366',
    },
    content: {
        marginBottom: 20,
    },
});