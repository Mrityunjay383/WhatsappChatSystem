import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function AgentDNChart({exData}) {

    const data = {
      labels: ['Pending Chats', 'Assigned Chats'],
      datasets: [
        {
          label: '# of Votes',
          data: [exData.penChats, exData.assChats],
          backgroundColor: [
            '#73FFC5',
            '#97A4FC',
          ],
          borderColor: ['#fff'],
          borderWidth: 1,
        },
      ],
    };

    return <Doughnut data={data} />
}

export default AgentDNChart;
