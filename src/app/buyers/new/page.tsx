'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FormProvider } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TagInput } from '@/components/ui/TagInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { BuyerSchema } from '@/lib/validators'
import axios from 'axios'
import {
  BHK_OPTIONS,
  CITIES,
  PROPERTY_TYPES,
  PURPOSES,
  SOURCES,
  TIMELINES,
} from '@/lib/types'
import { toast } from 'sonner'

type BuyerFormData = z.infer<typeof BuyerSchema>

export default function CreateBuyerPage() {

  const form = useForm({
    resolver: zodResolver(BuyerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      city: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      propertyType: undefined,
      bhk: undefined,
      purpose: undefined,
      source: undefined,
      timeline: undefined,
      tags: [],
    },
  });

    // ...existing logic for submit handler, etc...

    const onSubmit = async (data: BuyerFormData) => {
      try {
        await axios.post('/api/buyers', data);
        toast.success('Buyer lead created successfully!');
        form.reset();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || 'Failed to create buyer lead');
      }
    };

    return (
      <FormProvider {...form}>
        <form className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Buyer Lead</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="fullName" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="fullName">Full Name *</FormLabel>
                <FormControl>
                  <Input className="input input-bordered w-full" placeholder="John Doe" {...field} id="fullName" name="fullName" aria-required="true" aria-invalid={!!form.formState.errors.fullName} aria-describedby="fullName-error" />
                </FormControl>
                <FormMessage id="fullName-error" aria-live="assertive" />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormControl>
                  <Input className="input input-bordered w-full" placeholder="john.doe@example.com" {...field} id="email" name="email" aria-invalid={!!form.formState.errors.email} aria-describedby="email-error" />
                </FormControl>
                <FormMessage id="email-error" aria-live="assertive" />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="phone">Phone *</FormLabel>
                <FormControl>
                  <Input className="input input-bordered w-full" placeholder="9876543210" {...field} id="phone" name="phone" aria-required="true" aria-invalid={!!form.formState.errors.phone} aria-describedby="phone-error" />
                </FormControl>
                <FormMessage id="phone-error" aria-live="assertive" />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="city" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="city">City *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger id="city" name="city" aria-required="true" aria-invalid={!!form.formState.errors.city} aria-describedby="city-error">
                      <SelectValue placeholder="Select a city" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage id="city-error" aria-live="assertive" />
              </FormItem>
            )} />
            <FormField control={form.control} name="budgetMin" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="budgetMin">Min Budget</FormLabel>
                <FormControl>
                  <Input className="input input-bordered w-full" type="number" placeholder="e.g. 500000" id="budgetMin" name="budgetMin" min={0} value={field.value === undefined || field.value === null ? '' : Number(field.value)} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!form.formState.errors.budgetMin} aria-describedby="budgetMin-error" />
                </FormControl>
                <FormMessage id="budgetMin-error" aria-live="assertive" />
              </FormItem>
            )} />
            <FormField control={form.control} name="budgetMax" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="budgetMax">Max Budget</FormLabel>
                <FormControl>
                  <Input className="input input-bordered w-full" type="number" placeholder="e.g. 1000000" id="budgetMax" name="budgetMax" min={0} value={field.value === undefined || field.value === null ? '' : Number(field.value)} onChange={field.onChange} onBlur={field.onBlur} ref={field.ref} aria-invalid={!!form.formState.errors.budgetMax} aria-describedby="budgetMax-error" />
                </FormControl>
                <FormMessage id="budgetMax-error" aria-live="assertive" />
              </FormItem>
            )} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="propertyType" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="propertyType">Property Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger id="propertyType" name="propertyType" aria-required="true" aria-invalid={!!form.formState.errors.propertyType} aria-describedby="propertyType-error">
                      <SelectValue placeholder="Select a property type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROPERTY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage id="propertyType-error" aria-live="assertive" />
              </FormItem>
            )} />
            {(form.watch('propertyType') === 'Apartment' || form.watch('propertyType') === 'Villa') && (
              <FormField control={form.control} name="bhk" render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="bhk">BHK *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="bhk" name="bhk" aria-required="true" aria-invalid={!!form.formState.errors.bhk} aria-describedby="bhk-error">
                        <SelectValue placeholder="Select BHK" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {BHK_OPTIONS.map((bhk) => {
                        const bhkLabelMap: Record<string, string> = {
                          One: '1 BHK',
                          Two: '2 BHK',
                          Three: '3 BHK',
                          Four: '4 BHK',
                          Studio: 'Studio',
                        };
                        return <SelectItem key={bhk} value={bhk}>{bhkLabelMap[bhk]}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage id="bhk-error" aria-live="assertive" />
                </FormItem>
              )} />
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField control={form.control} name="purpose" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="purpose">Purpose *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger id="purpose" name="purpose" aria-required="true" aria-invalid={!!form.formState.errors.purpose} aria-describedby="purpose-error">
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PURPOSES.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage id="purpose-error" aria-live="assertive" />
              </FormItem>
            )} />
            <FormField control={form.control} name="source" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="source">Source *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger id="source" name="source" aria-required="true" aria-invalid={!!form.formState.errors.source} aria-describedby="source-error">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>{source}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage id="source-error" aria-live="assertive" />
              </FormItem>
            )} />
            <FormField control={form.control} name="timeline" render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="timeline">Timeline *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger id="timeline" name="timeline" aria-required="true" aria-invalid={!!form.formState.errors.timeline} aria-describedby="timeline-error">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMELINES.map((timeline) => {
                      const timelineLabelMap: Record<string, string> = {
                        ZeroToThreeMonths: '0-3m',
                        ThreeToSixMonths: '3-6m',
                        OverSixMonths: '>6m',
                        Exploring: 'Exploring',
                      };
                      return <SelectItem key={timeline} value={timeline}>{timelineLabelMap[timeline]}</SelectItem>;
                    })}
                  </SelectContent>
                </Select>
                <FormMessage id="timeline-error" aria-live="assertive" />
              </FormItem>
            )} />
          </div>
          <FormField control={form.control} name="tags" render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="tags">Tags</FormLabel>
              <FormControl>
                <TagInput value={field.value || []} onChange={field.onChange} suggestions={["hot", "follow-up", "NRI", "investor", "urgent", "repeat", "premium"]} placeholder="Add tags..." />
              </FormControl>
              <FormMessage id="tags-error" aria-live="assertive" />
            </FormItem>
          )} />
          <div className="flex justify-center pt-6">
            <Button type="submit" className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-all text-lg">Create Lead</Button>
          </div>
        </form>
      </FormProvider>
    );
}