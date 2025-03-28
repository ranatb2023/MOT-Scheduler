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
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FileUpload from "../global/file-upload";

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
                                        <FileUpload />
                                    </FormControl>
                                </FormItem>
                            )}>
                            </FormField>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </AlertDialog>
    );
};

export default GarageDetails;
