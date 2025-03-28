import GarageDetails from "@/components/forms/GarageDetails";
import { getAuthUserDetails, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { Plan } from "@prisma/client";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ searchParams }: { searchParams: { plan: Plan; state: string; code: string } }) => {

    const garageId = await verifyAndAcceptInvitation()
    console.log(garageId)

    //get users details
    const user = await getAuthUserDetails()
    if (garageId) {
        if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
            return redirect('/subaccount')
        }
        else if (user?.role === 'GARAGE_OWNER' || user?.role === 'GARAGE_ADMIN') {
            if (searchParams.plan) {
                return redirect(`/garage/${garageId}/billing?plan=${searchParams.plan}`)
            }
            if (searchParams.state) {
                const statePath = searchParams.state.split('__')[0]
                const stateGarageId = searchParams.state.split('__')[1]
                if (!stateGarageId) return <div>Not authorised</div>
                return redirect(`/garage/${stateGarageId}/${statePath}?code=${searchParams.code}`)
            } else return redirect(`/garage/${garageId}`)
        } else {
            return <div>Not authorised</div>
        }
    }

    const authUser = await currentUser()

    return (
        <div className='flex justify-center items-center mt-4'>
            <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
                <h1 className="text-4xl">Create a Garage</h1>
                <GarageDetails data={{ companyEmail: authUser?.emailAddresses[0].emailAddress }}/>
            </div>
        </div>
    )
}

export default Page;