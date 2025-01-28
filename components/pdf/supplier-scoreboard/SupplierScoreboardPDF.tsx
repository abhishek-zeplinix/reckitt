import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 5,
        backgroundColor: '#ffffff',
    },
    section: {
        marginBottom: 20,
        padding: 10,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333333',
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#444444',
    },
    infoGrid: {
        flexDirection: 'row',
        marginBottom: 10,
        borderBottom: 1,
        borderColor: '#EAEAEA',
        paddingBottom: 10,
        borderWidth: 1 //border width
    },
    infoColumn: {
        flex: 1,
        padding: 10,
        gap: 4
    },
    infoRow: {
        marginBottom: 8,
        borderBottom: 1,
        borderColor: '#EAEAEA',
    },
    label: {
        fontSize: 10,
        color: '#666666',
        marginBottom: 4,
    },
    value: {
        fontSize: 10,
        color: '#333333',
        padding: 5
    },
    graphsContainer: {
        height: 400,
        marginTop: 20,
    },
    graphSection: {
        marginBottom: 30,
    },
    graphTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444444',
    },
    graph: {
        width: '100%',
        height: 300,
        marginBottom: 10,
    },
    graphCaption: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
   
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        color: '#666666',
        fontSize: 10,
    },
    cellWrapper: {
        flex: 1,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreContainer: {
        borderRadius: 6,
        padding: '2px 8px 4px 8px',
        alignSelf: 'center',
    },
    scoreText: {
        fontSize: 10,
        color: '#ffffff',
        fontFamily: 'Helvetica-Bold'
    },
    iconContainer: {
        marginLeft: 4,
    },


    ratingsTable: {
        marginTop: 20,
        width: '100%', // Ensure it takes full width
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableCell: {
        flex: 1,
        fontSize: 12,
        color: '#333333',
        textAlign: 'center', // Align text properly
    },
    depCell: {
        flex: 1,
        fontSize: 12,
        color: '#DF177C',
        // textAlign: 'center',
    },

    rateCell: {
        flex: 1,
        fontSize: 12,
        color: '#333333',
        textAlign: 'left',
    },
    leftColumn: {
        flex: 1,
        padding: 10,
        borderRightWidth: 1, // Right border for left column
        borderColor: '#EAEAEA',
    },
    rightColumn: {
        flex: 1,
        padding: 10,
    },
    separatorLine: {
        width: 1, // Thin vertical separator
        backgroundColor: '#EAEAEA',
    },


});

const getBackgroundColor = (percentage: any) => {

    if (percentage >= 90) {
        return '#48BB78'; // Green
    } else if (percentage >= 70) {
        return '#EC934B'; // Orange
    } else if (percentage >= 50) {
        return '#ECC94B'; // Yellow
    } else {
        return '#F56565'; // Red
    }
};


const SupplierScoreboardPDF = ({ supplierData, ratingsData, chartImage, quarterlyData, halfYearlyData, selectedYear }: any) => {
    const formatDate = (timestamp: string) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleDateString();
    };

    const ScoreCell = ({ value }: any) => {
        const percentage = parsePercentage(value);
        const backgroundColor = getBackgroundColor(percentage);

        return (
            <View style={styles.cellWrapper}>
                <View style={[styles.scoreContainer, { backgroundColor }]}>
                    <Text style={styles.scoreText}>
                        {value}
                    </Text>
                    {percentage <= 50 && (
                        <View style={styles.iconContainer}>
                            <Icon />
                        </View>
                    )}
                </View>
            </View>
        );
    };


    const Icon = () => (
        <svg width="800px" height="800px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title />
            <g id="Complete">
                <g id="info-circle">
                    <g>
                        <circle cx="12" cy="12" data-name="--Circle" fill="none" id="_--Circle" r="10" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="12" y2="16" />
                        <line fill="none" stroke="#000000" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="12" x2="12" y1="8" y2="8" />
                    </g>
                </g>
            </g>

        </svg>
    )

    const parsePercentage = (value: any) => {
        if (!value) return 0;
        const num = parseFloat(value.replace('%', '')); // Remove '%' and convert to number

        return isNaN(num) ? 0 : num;
    };


    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <Text style={styles.header}>Supplier Scoreboard Report</Text>

                <View style={styles.infoGrid}>
                    {/* Left Grid */}
                    <View style={[styles.infoColumn, styles.leftColumn]}>

                    <View style={styles.infoRow}>
                            <Text style={styles.label}>Supplier Name:
                                <Text style={styles.value}>{supplierData?.supplierName || 'N/A'}</Text>
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Supplier ID:
                                <Text style={styles.value}>{supplierData?.supId || 'N/A'}</Text>
                            </Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Category:
                                <Text style={styles.value}>{supplierData?.category?.categoryName || 'N/A'}</Text>
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Sub-Category:
                                <Text style={styles.value}>{supplierData?.subCategories?.subCategoryName || 'N/A'}</Text>
                            </Text>
                        </View>
                      
                       
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Supplier Manufacturer Name:
                                <Text style={styles.value}>{supplierData?.supplierManufacturerName || 'N/A'}</Text>
                            </Text>
                        </View>
                    </View>

                    {/* Separator Line */}
                    {/* <View style={styles.separatorLine} /> */}

                    {/* Right Grid */}
                    <View style={[styles.infoColumn, styles.rightColumn]}>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Warehouse Location:
                                <Text style={styles.value}>{supplierData?.warehouseLocation || 'N/A'}</Text>
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Assessment Pending:
                                <Text style={styles.value}>N/A</Text>
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Onboarding Date:
                                <Text style={styles.value}>{formatDate(supplierData?.createdAt)}</Text>
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Supplier Tier:
                                <Text style={styles.value}>N/A</Text>
                            </Text>
                        </View>
                    </View>
                </View>


                <View style={styles.ratingsTable}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCell}></Text>
                        <Text style={styles.tableCell}>{`H1 ${selectedYear}`}</Text>
                        <Text style={styles.tableCell}>{`H2 ${selectedYear}`}</Text>
                    </View>

                    {halfYearlyData?.map((item: any, index: any) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.depCell}>{item.name}</Text>
                            <ScoreCell value={item.status1} />
                            <ScoreCell value={item.status2} />
                        </View>
                    ))}
                </View>

                {/* Quarterly Table */}
                <View style={styles.ratingsTable}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCell}></Text>
                        <Text style={styles.tableCell}>{`Q1 ${selectedYear}`}</Text>
                        <Text style={styles.tableCell}>{`Q2 ${selectedYear}`}</Text>
                        <Text style={styles.tableCell}>{`Q3 ${selectedYear}`}</Text>
                        <Text style={styles.tableCell}>{`Q4 ${selectedYear}`}</Text>
                    </View>

                    {quarterlyData?.map((item: any, index: any) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.depCell}>{item.name}</Text>
                            <ScoreCell value={item.q1} />
                            <ScoreCell value={item.q2} />
                            <ScoreCell value={item.q3} />
                            <ScoreCell value={item.q4} />
                        </View>
                    ))}
                </View>

                {/* Ratings Table */}
                <View style={styles.ratingsTable}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableCell}>Period</Text>
                        <Text style={styles.tableCell}>Rating</Text>
                        <Text style={styles.tableCell}>Remark</Text>
                        <Text style={styles.tableCell}>Action</Text>
                    </View>
                    {ratingsData?.map((rating: any, index: number) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.rateCell}>{rating.name}</Text>
                            <ScoreCell value={rating.status1} />
                            <Text style={styles.tableCell}>{rating.remark}</Text>
                            <Text style={styles.tableCell}>{rating.action}</Text>
                        </View>
                    ))}

                </View>



                {/* Performance Graphs */}
                <View style={styles.graphsContainer}>

                    {chartImage && (
                        <View style={styles.graphSection}>
                            <Text style={styles.graphTitle}></Text>
                            <Image src={chartImage} style={styles.graph} />
                            <Text style={styles.graphCaption}></Text>
                        </View>
                    )}
                </View>


                {/* Footer */}
                <Text style={styles.footer}>
                    Reckitt &copy; 2025
                </Text>
            </Page>
        </Document>
    );
};

export default SupplierScoreboardPDF;