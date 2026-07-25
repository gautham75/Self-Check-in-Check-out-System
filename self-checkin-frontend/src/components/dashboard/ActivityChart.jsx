import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const AttendanceLineChart = ({ dataPoints }) => {
  const labels = dataPoints?.labels || ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];
  const checkInValues = dataPoints?.checkIns || [12, 45, 88, 120, 150, 165, 172, 180];
  const checkOutValues = dataPoints?.checkOuts || [0, 2, 8, 15, 35, 60, 110, 145];

  const data = {
    labels,
    datasets: [
      {
        label: 'Check-Ins',
        data: checkInValues,
        borderColor: '#FFD036',
        backgroundColor: 'rgba(255, 208, 54, 0.25)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#212227',
        pointBorderColor: '#FFD036',
        pointBorderWidth: 2,
      },
      {
        label: 'Check-Outs',
        data: checkOutValues,
        borderColor: '#212227',
        backgroundColor: 'rgba(33, 34, 39, 0.05)',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#FFFFFF',
        pointBorderColor: '#212227',
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
          usePointStyle: true,
          color: '#1C1D21',
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#212227',
        titleFont: { family: 'Plus Jakarta Sans', weight: 700 },
        bodyFont: { family: 'Plus Jakarta Sans' },
        padding: 12,
        borderRadius: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#EFECE5' },
        ticks: { color: '#73757F', font: { family: 'Plus Jakarta Sans' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#73757F', font: { family: 'Plus Jakarta Sans' } }
      }
    }
  };

  return (
    <div style={{ height: '280px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export const EventDistributionBarChart = ({ distribution }) => {
  const labels = distribution?.labels || ['Tech Conf 2026', 'AI Summit', 'Annual Gala', 'Dev Workshop', 'Hackathon'];
  const values = distribution?.values || [120, 95, 210, 65, 140];

  const data = {
    labels,
    datasets: [
      {
        label: 'Participants Registered',
        data: values,
        backgroundColor: [
          '#212227',
          '#FFD036',
          '#212227',
          '#FFD036',
          '#6E7079',
        ],
        borderRadius: 12,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#212227',
        titleFont: { family: 'Plus Jakarta Sans', weight: 700 },
        bodyFont: { family: 'Plus Jakarta Sans' },
        padding: 12,
        borderRadius: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#EFECE5' },
        ticks: { color: '#73757F', font: { family: 'Plus Jakarta Sans' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#73757F', font: { family: 'Plus Jakarta Sans' } }
      }
    }
  };

  return (
    <div style={{ height: '280px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};
