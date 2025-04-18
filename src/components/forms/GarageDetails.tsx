"use client";
import { Garage } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FileUpload from "../global/file-upload";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { NumberInput } from "@tremor/react"
import { deleteGarage, initUser, saveActivityLogsNotification, updateGarageDetails, upsertGarage } from "@/lib/queries";
import { Button } from "../ui/button";
import Loading from "../global/loading";
import { v4 } from "uuid";

type Props = {
    data?: Partial<Garage>;
};

const FormSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Garage name must be atleast 2 characters." }),
    companyEmail: z.string().min(1),
    companyPhone: z.string().min(1),
    whiteLabel: z.boolean(),
    address: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    garageLogo: z.string().min(1),
});

const GarageDetails = ({ data }: Props) => {
    const { toast } = useToast();
    const router = useRouter();
    const [deletingGarage, setDeletingGarage] = useState(false);
    const form = useForm<z.infer<typeof FormSchema>>({
        mode: "onChange",
        resolver: zodResolver(FormSchema),
        defaultValues: {
            name: data?.name ?? "",
            companyEmail: data?.companyEmail ?? "",
            companyPhone: data?.companyPhone ?? "",
            whiteLabel: data?.whiteLabel ?? false,
            address: data?.address ?? "",
            city: data?.city ?? "",
            zipCode: data?.zipCode ?? "",
            state: data?.state ?? "",
            country: data?.country ?? "",
            garageLogo: data?.garageLogo ?? "",
        },
    });

    const isLoading = form.formState.isSubmitting

    useEffect(() => {
        if (data) {
            form.reset({
                name: data.name ?? "",
                companyEmail: data.companyEmail ?? "",
                companyPhone: data.companyPhone ?? "",
                whiteLabel: data.whiteLabel ?? false,
                address: data.address ?? "",
                city: data.city ?? "",
                zipCode: data.zipCode ?? "",
                state: data.state ?? "",
                country: data.country ?? "",
                garageLogo: data.garageLogo ?? "",
            })
        }
    }, [data])

    const handleSubmit = async (values:z.infer<typeof FormSchema>) => {
        try {
            let newUserData;
            let customerId;
            if(!data?.id) {
                const bodyData = {
                    email: values.companyEmail,
                    name: values.name,
                    shipping: {
                        address: {
                            city: values.city,
                            country: values.country,
                            line1: values.address,
                            postal_code: values.zipCode,
                            state: values.zipCode,
                        },
                        name: values.name,
                    },
                    address: {
                        city: values.city,
                        country: values.country,
                        line1: values.address,
                        postal_code: values.zipCode,
                        state: values.zipCode,
                    },
                }
            }
            newUserData = await initUser({ role: 'GARAGE_OWNER' })
            if(!data?.id) {
                const response = await upsertGarage({
                    id: data?.id ? data.id : v4(),
                    address: values.address,
                    garageLogo: values.garageLogo,
                    city: values.city,
                    companyPhone: values.companyPhone,
                    country: values.country,
                    name: values.name,
                    state: values.state,
                    whiteLabel: values.whiteLabel,
                    zipCode: values.zipCode,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    companyEmail: values.companyEmail,
                    connectAccountId: "",
                    goal: 5,
                });
                toast({
                    title: 'Created Garage',
                })
                return router.refresh()
            }
        } catch (error) {
            console.log(error)
            toast({
                variant: 'destructive',
                title: 'Opps',
                description: 'Could not create your garage'
            })
        }
    }

    const handleDeleteGarage = async () => {
        if (!data?.id) return
        setDeletingGarage(true)
        try {
            const response = await deleteGarage(data.id)
            toast({
                title: 'Deleted Garage',
                description: 'Deleted your garage and all subaccounts'
            })
            router.refresh()
        } catch (error) {
            console.log(error)
            toast({
                variant: 'destructive',
                title: 'Opps',
                description: 'Could not delete your garage and all subaccounts'
            })
        }
        setDeletingGarage(false)
    }

    return (
        <AlertDialog>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Garage Information</CardTitle>
                    <CardDescription>
                        Lets create a garage for your business. You can edit garage settings
                        later from the garage settings tab.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                            <FormField disabled={isLoading} control={form.control} name="garageLogo" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Garage Logo</FormLabel>
                                    <FormControl>
                                        <FileUpload apiEndpoint="garageLogo" onChange={field.onChange} value={field.value} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="flex md:flex-row gap-4">
                                <FormField disabled={isLoading} control={form.control} name="name" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Garage Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Garage Name" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField disabled={isLoading} control={form.control} name="companyEmail" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Garage Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>
                            <div className="flex md:flex-row gap-4">
                                <FormField disabled={isLoading} control={form.control} name="companyPhone" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Garage Phone Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Garage Phone Number" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            <FormField disabled={isLoading} control={form.control} name="whiteLabel" render={({ field }) => {
                                return (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg borderr gap-4 p-4">
                                        <div>
                                            <FormLabel>Whitelabel Garage</FormLabel>
                                            <FormDescription>
                                                Turning on whitelabel mode will show your garage logo to all sub accounts by default. You can overwrite this functionality through sub account settings.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )
                            }} />

                            <FormField disabled={isLoading} control={form.control} name="address" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="123 st..." {...field} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            <div className="flex md:flex-row gap-4">
                                <FormField disabled={isLoading} control={form.control} name="city" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>City</FormLabel>
                                        <FormControl>
                                            <Input placeholder="City" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField disabled={isLoading} control={form.control} name="state" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>State</FormLabel>
                                        <FormControl>
                                            <Input placeholder="State" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                                <FormField disabled={isLoading} control={form.control} name="zipCode" render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Zipcode</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Zipcode" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )} />
                            </div>

                            <FormField disabled={isLoading} control={form.control} name="country" render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Country" {...field} />
                                    </FormControl>
                                </FormItem>
                            )} />

                            {data?.id && (
                                <div className="flex flex-col gap-2">
                                    <FormLabel>Create a Goal</FormLabel>
                                    <FormDescription>✨ Create a goal for your garage. As your business grows your goals grow too so don't forget to set the bar heigher!</FormDescription>
                                    <NumberInput
                                        defaultValue={data?.goal}
                                        onValueChange={async (val: number) => {
                                            if (!data?.id) return
                                            await updateGarageDetails(data.id, { goal: val })
                                            await saveActivityLogsNotification({
                                                garageId: data.id,
                                                description: `Updated the agency goal to | ${val} Sub Account`,
                                                subAccountId: undefined,
                                            })
                                            router.refresh
                                        }}
                                        min={1}
                                        className="bg-background !border !border-input"
                                        placeholder="Sub Account Goal"
                                    />
                                </div>
                            )}
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loading /> : 'Save Garage Information'}
                            </Button>

                        </form>
                    </Form>
                    
                    {data?.id && (
                        <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
                            <div>
                                <div>Danger Zone</div>
                                <div className="text-muted-foreground">Deleting your garage cannot be undone. This will also delete all sub accounts and all data related to your sub accounts. Sub accounts will no longer have access to funnels, contacts etc.</div>    
                            </div>
                            <AlertDialogTrigger
                                disabled={isLoading || deletingGarage} 
                                className="text-red-600 p-2 text-center mt-2 rounded-md hover:bg-red-600 hover:text-white whitespace-nowrap">
                                    {deletingGarage ? 'Deleting...' : 'Delete Garage'}
                            </AlertDialogTrigger>
                        </div>
                    )}

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-left">
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                                This action cannot be undone. This will permanently delete the Garage account and all related sub accounts.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex items-center">
                            <AlertDialogCancel className="mb-2">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                disabled={deletingGarage}
                                className="bg-destructive hover:bg-destructive"
                                onClick={handleDeleteGarage}
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default GarageDetails;
