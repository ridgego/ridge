import React from 'react';

export default {
    title: '输入测试',
    component: ({ val, input, increase }) => {
        const inc = () => {
            increase && increase(val + 1);
        };

        return <><input value={val} onChange= {e => {
            input(e.currentTarget.value);
        }}></input><button onClick={inc}>+1</button></>;
    },
    props: [{
        name: 'val',
        type: 'string',
        input: true
    }],
    events: [{
        name: 'increase'
    }]

};
