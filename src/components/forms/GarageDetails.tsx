"use client";
import { Garage } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AlertDialog } from "../ui/alert-dialog";
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
import { saveActivityLogsNotification, updateGarageDetails } from "@/lib/queries";

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
            name: data?.name,
            companyEmail: data?.companyEmail,
            companyPhone: data?.companyPhone,
            whiteLabel: data?.whiteLabel,
            address: data?.address,
            city: data?.city,
            zipCode: data?.zipCode,
            state: data?.state,
            country: data?.country,
            garageLogo: data?.garageLogo,
        },
    });

    const isLoading = form.formState.isSubmitting

    useEffect(() => {
        if (data) {
            form.reset(data)
        }
    }, [data])

    const handleSubmit = async () => {

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

                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default GarageDetails;
