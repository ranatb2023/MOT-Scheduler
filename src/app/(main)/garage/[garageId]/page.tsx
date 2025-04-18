import React from 'react'

const Page = async ({ params }: { params: { garageId: string } }) => {
    return <div>{params.garageId}</div>;
};

export default Page