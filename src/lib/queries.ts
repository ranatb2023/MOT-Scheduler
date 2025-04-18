"use server"

import { currentUser } from "@clerk/nextjs/server"
import { db } from "./db"
import { Garage, Plan, Role, User } from "@prisma/client"
import { redirect } from "next/navigation"
import { clerkClient } from "@clerk/clerk-sdk-node"

export const getAuthUserDetails = async () => {
    const user = await currentUser()
    if(!user) {
        return
    }

    const userData = await db.user.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
        },
        include: {
            Garage: {
                include: {
                    SidebarOption: true,
                    subAccount: {
                        include: {
                            SidebarOption: true,
                        },
                    },
                },
            },
            Permissions: true,
        },
    })
    return userData
}

export const saveActivityLogsNotification = async ({
    garageId,
    description,
    subAccountId,
}: {
    garageId?: string
    description: string
    subAccountId?: string
}) => {
    const authUser = await currentUser()
    let userData;
    if(!authUser){
        const response = await db.user.findFirst({
            where: {
                Garage: {
                    subAccount: {
                        some: { id: subAccountId },
                    },
                },
            },
        })
        if (response) {
            userData = response
        }
    } else {
        userData = await db.user.findUnique({
            where: {
                email: authUser?.emailAddresses[0].emailAddress
            },
        })
    }

    if (!userData) {
        console.log('Could not find a user')
        return
    }

    let foundGarageId = garageId
    if(!foundGarageId){
        if(!subAccountId){
            throw new Error(
                'You need to provide atleast an Garage Id or subaccount Id'
            )
        }

        const response = await db.subAccount.findUnique({
            where: { id: subAccountId },
        })

        if (response) foundGarageId = response.garageId
    }

    if(subAccountId) {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Garage: {
                    connect: {
                        id: foundGarageId,
                    },
                },
                SubAccount: {
                    connect: { id: subAccountId },
                },
            },
        })
    } else {
        await db.notification.create({
            data: {
                notification: `${userData.name} | ${description}`,
                User: {
                    connect: {
                        id: userData.id,
                    },
                },
                Garage: {
                    connect: {
                        id: foundGarageId,
                    },
                },
            },
        })
    }
}

export const createTeamUser = async (garageId: string, user: User) => {
    if (user.role === 'GARAGE_OWNER') return null
    const response = await db.user.create({ data: { ...user } })
    return response
}

export const verifyAndAcceptInvitation = async () => {
    const user = await currentUser()
    if (!user) return redirect('/sign-in')

    const invitationExists = await db.invitation.findUnique({
        where: {
            email: user.emailAddresses[0].emailAddress,
            status: 'PENDING'
        },
    })

    if(invitationExists){
        const userDetails = await createTeamUser(invitationExists.garageId, {
            email: invitationExists.email,
            garageId: invitationExists.garageId,
            avatarUrl: user.imageUrl,
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            role: invitationExists.role,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        await saveActivityLogsNotification({
            garageId: invitationExists?.garageId,
            description: `Joined`,
            subAccountId: undefined,
        })
    
        if(userDetails) {
            await clerkClient.users.updateUserMetadata(user.id, {
                privateMetadata: {
                    role: userDetails.role || 'SUBACCOUNT_USER',
                },
            })

            await db.invitation.delete({
                where: { email: userDetails.email },
            })

            return userDetails.garageId
        } else return null
    } else {
        const garage = await db.user.findUnique({
            where: {
                email: user.emailAddresses[0].emailAddress
            }
        })
        return garage ? garage.garageId : null
    }
}

export const updateGarageDetails = async (garageId:string, garageDetails: Partial<Garage>) => {
    const response = await db.garage.update({
        where: { id: garageId },
        data: { ...garageDetails },
    })
    return response
}

export const deleteGarage = async (garageId: string) => {
    const response = await db.garage.delete({
        where: {
            id: garageId
        }
    })
    return response
}

export const initUser = async (newUser: Partial<User>) => {
    const user = await currentUser()
    if(!user) return

    const userData = await db.user.upsert({
        where: {
            email: user.emailAddresses[0].emailAddress
        },
        update: newUser,
        create: {
            id: user.id,
            avatarUrl: user.imageUrl,
            email: user.emailAddresses[0].emailAddress,
            name: `${user.firstName} ${user.lastName}`,
            role: newUser.role || 'SUBACCOUNT_USER'
        },
    })

    await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
            role: newUser.role || 'SUBACCOUNT_USER'
        },
    })

    console.log("✅ Created user:", userData);
    return userData;
}

export const upsertGarage = async (garage: Garage, price?: Plan) => {
    if (!garage.companyEmail) return null
    try {
        const garageDetails = await db.garage.upsert({
            where: {
                id: garage.id,
            },
            update: {
                 address: garage.address,
                garageLogo: garage.garageLogo,
                city: garage.city,
                companyPhone: garage.companyPhone,
                country: garage.country,
                name: garage.name,
                state: garage.state,
                whiteLabel: garage.whiteLabel,
                zipCode: garage.zipCode,
                updatedAt: new Date(),
                companyEmail: garage.companyEmail,
                connectAccountId: garage.connectAccountId || "",
                goal: garage.goal,
            },
            create: {
                users: {
                    connect: { email: garage.companyEmail },
                },
                ...garage,
                SidebarOption: {
                    create: [
                        {
                            name: 'Dashboard',
                            icon: 'category',
                            link: `/garage/${garage.id}`,
                        },
                        {
                            name: 'Launchpad',
                            icon: 'clipboardIcon',
                            link: `/garage/${garage.id}/launchpad`,
                        },
                        {
                            name: 'Billing',
                            icon: 'payment',
                            link: `/garage/${garage.id}/billing`,
                        },
                        {
                            name: 'Settings',
                            icon: 'settings',
                            link: `/garage/${garage.id}/settings`,
                        },
                        {
                            name: 'Sub Accounts',
                            icon: 'person',
                            link: `/garage/${garage.id}/all-subaccounts`,
                        },
                        {
                            name: 'Team',
                            icon: 'shield',
                            link: `/garage/${garage.id}/team`,
                        },
                    ],
                },
            },
        });
        return garageDetails;
    } catch (error: any) {
        console.error("🚨 Error in upsertGarage:", error);
        throw new Error("Could not create garage");
    }
}