import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface DiagnosticScores {
  sns_score: number;
  structure_score: number;
  ux_score: number;
  app_score: number;
  theme_score: number;
}

interface DiagnosticChartProps {
  scores: DiagnosticScores;
  className?: string;
}

const DiagnosticChart: React.FC<DiagnosticChartProps> = ({ scores, className }) => {
  const data = {
    labels: ['SNS運用', '商品構造', 'UI/UX', 'アプリ活用', 'テーマ適合度'],
    datasets: [
      {
        label: '診断スコア',
        data: [
          scores.sns_score || 0,
          scores.structure_score || 0,
          scores.ux_score || 0,
          scores.app_score || 0,
          scores.theme_score || 0
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div className={className}>
      <Radar data={data} options={options} />
    </div>
  );
};

export default DiagnosticChart;
