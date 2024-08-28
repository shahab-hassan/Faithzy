import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
// eslint-disable-next-line no-unused-vars
import Chart from 'chart.js/auto';
import axios from 'axios';

const AdminRevenue = () => {

    const [generalData, setGeneralData] = useState({
        totalRevenue: 0,
        fromOrders: 0,
        fromMemberships: 0,
        fromBoosts: 0,
        newUsers: 0,
        netProfit: 0,
    });

    const [revenueData, setRevenueData] = useState([]);
    const [netProfitData, setNetProfitData] = useState([]);
    const [filter, setFilter] = useState('7d');
    
    console.log(filter);

    useEffect(() => {
        const fetchData = async () => {
            const response = await axios.get(`http://localhost:5000/api/v1/settings/admin/revenue?filter=${filter}`);
            setGeneralData(response.data.generalData);
            setRevenueData(response.data.revenue);
            setNetProfitData(response.data.netProfit);
        };

        fetchData();
    }, [filter]);

    const revenueChartData = {
        labels: revenueData.map(data => data.date),
        datasets: [
            {
                label: 'Total Revenue',
                data: revenueData.map(data => data.total),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            },
        ],
    };

    const pieDataDum = {
        labels: ['Orders', 'Boost', 'Memberships'],
        datasets: [
            {
                label: 'Total Revenue',
                data: [generalData.fromOrders, generalData.fromBoosts, generalData.fromMemberships],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1,
            },
        ],
    };

    const netProfitChartData = {
        labels: netProfitData.map(data => data.date),
        datasets: [
            {
                label: 'Net Profit',
                data: netProfitData.map(data => data.total),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 12,
                    },
                    color: '#333',
                    padding: 20,
                    boxWidth: 15,
                    boxHeight: 15,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    marginTop: 20
                },
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0,0,0,0.7)',
            },
        },
    };

    return (
        <div className='adminRevenueDiv'>
            <div className="adminRevenueContent">

                <div className="header">
                    <h1 className="primaryHeading"><span>Revenue</span> & <span>Profit</span></h1>
                    <select onChange={e => setFilter(e.target.value)} className='dropdownPlus'>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="lifetime">Lifetime</option>
                    </select>
                </div>

                <div className="revenueOverviewDetails">
                    <div className="overviewBoxB overviewBox">
                        <h2 className="secondaryHeading">Total Revenue</h2>
                        <div className="value">${generalData.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div className="overviewBoxB overviewBox">
                        <h2 className="secondaryHeading">From Orders</h2>
                        <div className="value">${generalData.fromOrders.toFixed(2)}</div>
                    </div>
                    <div className="overviewBoxB overviewBox">
                        <h2 className="secondaryHeading">From Paid Memberships</h2>
                        <div className="value">${generalData.fromMemberships.toFixed(2)}</div>
                    </div>
                    <div className="overviewBoxB overviewBox">
                        <h2 className="secondaryHeading">From Boosts</h2>
                        <div className="value">${generalData.fromBoosts.toFixed(2)}</div>
                    </div>
                </div>

                <div className="revenueDetailsUpper">
                    <div className="revenueBarChart">
                        <div className="upper">
                            <h2 className='secondaryHeading'><span>Revenue</span> Overview</h2>
                        </div>
                        <div className="chartContainer">
                            <Bar data={revenueChartData} />
                        </div>
                    </div>
                    <div className="revenueBarChartOverview">
                        <div className="overviewBoxB overviewBox">
                            <h2 className="secondaryHeading">Net Profit</h2>
                            <div className="value">${generalData.netProfit.toFixed(2)}</div>
                        </div>
                        <div className="overviewBoxB overviewBox">
                            <h2 className="secondaryHeading">New Users</h2>
                            <div className="value">{(generalData.newUsers < 10 && "0") + generalData.newUsers}</div>
                        </div>
                        <div className="revenuePieChart overviewBox">
                            <h2 className="secondaryHeading">Revenue From</h2>
                            <Pie data={pieDataDum} options={options} />
                        </div>
                    </div>
                </div>

                <div className="revenueDetailsLower">
                    <div className="revenueLineChart">
                        <div className="upper">
                            <h2 className='secondaryHeading'><span>Revenue</span> Over Time</h2>
                        </div>
                        <div className="chartContainer">
                            <Line data={revenueChartData} />
                        </div>
                    </div>
                    <div className="profitLineChart">
                        <div className="upper">
                            <h2 className='secondaryHeading'><span>Profit</span> Over Time</h2>
                        </div>
                        <div className="chartContainer">
                            <Line data={netProfitChartData} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminRevenue;
