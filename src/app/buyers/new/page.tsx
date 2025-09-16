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
      notes: '',
      budgetMin: undefined,
      budgetMax: undefined,
      tags: [],
    },
  })


  console.log('Form errors:', form.formState.errors)

  const propertyTypeWatcher = form.watch('propertyType')

  async function onSubmit(values: BuyerFormData) {
  console.log('Submitting lead:', values)
    try {
      const response = await axios.post('/api/buyers', values)
      console.log('API response:', response)
      if (response.data.error) {
        alert('API error: ' + JSON.stringify(response.data.error))
        return
      }
      toast("Lead created successfully!");

      window.location.href = '/buyers'
    } catch (error: any) {
      console.error('API error:', error)
      alert(error?.response?.data?.error || error?.message || 'An error occurred')
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create Buyer Lead</h1>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} id="fullName" name="fullName" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} id="email" name="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone *</FormLabel>
                  <FormControl>
                    <Input placeholder="9876543210" {...field} id="phone" name="phone" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="city" name="city">
                        <SelectValue placeholder="Select a city" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetMin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 500000"
                      id="budgetMin"
                      name="budgetMin"
                      min={0}
                      value={field.value === undefined || field.value === null ? '' : Number(field.value)}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetMax"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 1000000"
                      id="budgetMax"
                      name="budgetMax"
                      min={0}
                      value={field.value === undefined || field.value === null ? '' : Number(field.value)}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="propertyType" name="propertyType">
                        <SelectValue placeholder="Select a property type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROPERTY_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(propertyTypeWatcher === 'Apartment' ||
              propertyTypeWatcher === 'Villa') && (
              <FormField
                control={form.control}
                name="bhk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BHK *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger id="bhk" name="bhk">
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
                          return (
                            <SelectItem key={bhk} value={bhk}>
                              {bhkLabelMap[bhk]}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="purpose" name="purpose">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PURPOSES.map((purpose) => (
                        <SelectItem key={purpose} value={purpose}>
                          {purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="source" name="source">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SOURCES.map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeline *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger id="timeline" name="timeline">
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
                        return (
                          <SelectItem key={timeline} value={timeline}>
                            {timelineLabelMap[timeline]}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" onClick={() => alert('Button clicked')}>Create Lead</Button>
        </form>
      </FormProvider>
    </div>
  )
}