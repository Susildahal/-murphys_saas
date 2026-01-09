'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Loader2, User, Mail, Globe, Briefcase } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { updateProfile, clearUpdateSuccess, fetchProfileByEmail, createProfile } from '@/lib/redux/slices/profileSlice';
import { useToast } from '@/hooks/use-toast';
import {
  CountryDropdown,
  RegionDropdown,
} from 'react-country-region-selector';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils';
import { getMee } from "@/lib/redux/slices/meeSlice";
import { ChevronDownIcon } from "lucide-react"
import { useSearchParams, useParams, useRouter, usePathname } from 'next/navigation';
import axiosInstance from '@/lib/axios';



// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  middleName: z.string().optional(),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().nullable(),
  phone: z.string().regex(/^\+?[\d\s-]+$/, { message: 'Please enter a valid phone number' }).optional().or(z.literal('')),
  gender: z.string().optional(),
  dob: z.string().optional().refine((v) => {
    if (!v) return true;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    let age = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) {
      age--;
    }
    return age >= 17;
  }, { message: 'You must be at least 17 years old' }),
  doj: z.string().optional(),
  bio: z.string().max(500, { message: 'Bio must be less than 500 characters' }).optional(),
  website: z.string().url({ message: 'Please enter a valid URL' }).or(z.literal('')).optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  position: z.string().min(2, { message: 'Position must be at least 2 characters' }),
});

type ProfileFormData = z.infer<typeof profileSchema>;



export default function ProfileUpdateForm() {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { loading, error, updateSuccess, profile: data } = useAppSelector((state) => state.profile);
  const pd = data as any;
  const { data: meeData } = useAppSelector((state) => state.mee);
  const searchParams = useSearchParams();
  const params = useParams();
  const nameParam = searchParams.get('name') || params?.name;
  const router = useRouter();
  const pathname = usePathname();

  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [dojDate, setDojDate] = React.useState<Date | undefined>(undefined)
  const [opendoj, setOpenDoj] = React.useState(false)
  const [invitedata , setInvitedata] = useState<any>([]);


  // Fetch profile data when mee email is available
  React.useEffect(() => {
    if (meeData?.email) {
      dispatch(fetchProfileByEmail(meeData.email));
    }
  }, [dispatch, meeData?.email]);

  // Always fetch mee data on mount
  React.useEffect(() => {
    if (!meeData) {
      dispatch(getMee());
    }
  }, [dispatch]);

  const invite = async () => {
    if ( meeData?.email) {
      try {
        const response = await axiosInstance.get(`/invites`,{
          params: {
            email: meeData?.email,
          },
        });    
            setInvitedata(response.data?.data);
      } catch (error: any) {
        console.error('Error sending invitation:', error);
      }
    }
  };
  console.log("invitedata", invitedata)
  React.useEffect(() => {
    invite();
  }, [ meeData?.email]);
  

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      firstName: invitedata.firstName || '',
      middleName: '',
      lastName: invitedata.lastName || '',
      email: meeData?.email || '',
      phone: '',
      gender: '',
      dob: '',
      doj: '',
      bio: '',
      website: '',
      country: '',
      state: '',
      city: '',
      position: '',
    },
  });

  // Reset form when invitedata loads so default values update after async fetch
  React.useEffect(() => {
    if (invitedata && (invitedata.firstName || invitedata.lastName)) {
      try {
        form.reset({
          ...form.getValues(),
          firstName: invitedata.firstName || '',
          lastName: invitedata.lastName || '',
        });
      } catch (e) {
        // guard: form may not be ready in rare cases
        console.warn('Could not reset form with invitedata', e);
      }
    }
  }, [invitedata, form]);
  
  // Fetch profile data when mee email is available
  React.useEffect(() => {
    if (data) {

      form.reset({
        firstName: (data as any).firstName || '',
        middleName: (data as any).middleName || '',
        lastName: (data as any)?.lastName || '',
        email: meeData.email || '',
        phone: (data as any).phone || '',
        gender: (data as any).gender || '',
        dob: (data as any).dob || '',
        doj: (data as any).doj || '',
        bio: (data as any).bio || '',
        website: (data as any).website || '',
        country: (data as any).country || '',
        state: (data as any).state || '',
        city: (data as any).city || '',
        position: (data as any).position || '',
      });

      // Set image preview if profile image exists
      if (data.profile_image) {
        setImagePreview(data.profile_image);
      }

      // Set dates if available
      if ((data as any).dob) {
        setDate(new Date((data as any).dob));
      }
      if ((data as any).doj) {
        setDojDate(new Date((data as any).doj));
      }
    }
  }, [data, form]);


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Image must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };

  // Update onSubmit to merge name fields and handle both create and update
  const onSubmit = async (formData: ProfileFormData) => {
    try {
      // Merge name fields
      const email = meeData?.email || formData.email || '';
      const submitData = { ...formData, email };

      // Prepare FormData with binary image
      const fd = new FormData();
      Object.entries(submitData).forEach(([key, value]) => {
        if (value) fd.append(key, String(value));
      });
      if (imageFile) {
        fd.append('profile_image', imageFile);
      }

      // Determine if we're creating or updating
      let result;
      const isUpdate = Boolean(pd?._id);

      if (isUpdate) {
        // Update existing profile
        const id = String(pd?._id);
        result = await dispatch(updateProfile({ id, formData: fd as any })).unwrap();
        toast({
          title: 'Success!',
          description: 'Profile updated successfully',
        });
      } else {
        // Create new profile
        result = await dispatch(createProfile(fd as any)).unwrap();
        toast({
          title: 'Success!',
          description: 'Profile created successfully',
        });
      }

  
    

      setTimeout(() => {
        dispatch(clearUpdateSuccess());
      }, 3000);

      // Navigate based on current route
      if (pathname === '/profile') {
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error || 'Failed to save profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <>    
    <div className="min-h-screen p-4 md:p-8 flex justify-center items-start">

    

      <Card className=" border-none w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {pd?._id ? 'Update Profile' : `Please Complete Your Profile Information First ${invitedata.firstName + ' ' + invitedata.lastName}   `}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {pd?._id ? 'Update your profile information' : 'Complete your profile details'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Profile Image */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-muted shadow-lg">
                  <AvatarImage src={imagePreview} className="object-cover" />
                  <AvatarFallback className="text-4xl bg-muted">
                    {form.watch('firstName')?.[0] || <User className="w-12 h-12 text-muted-foreground" />}
                  </AvatarFallback>
                </Avatar>
                <label className="cursor-pointer">
                  <Button type="button" variant="outline" className="gap-2" asChild>
                    <span>
                      <Camera className="w-4 h-4" />
                      Upload Photo
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </span>
                  </Button>
                </label>
              </div>

              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                      
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Michael" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
            
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            {...field}
                            value={meeData?.email || field.value}
                            disabled
                          />
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-4">
               
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl className='w-full'>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover open={open} onOpenChange={setOpen}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-between font-normal",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                {date ? date.toLocaleDateString() : "Select date"}
                                <ChevronDownIcon className="w-4 h-4" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={date}
                              captionLayout="dropdown"
                              onSelect={(selectedDate) => {
                                setDate(selectedDate);
                                if (selectedDate) {
                                  field.onChange(selectedDate.toISOString().split('T')[0]);
                                }
                                setOpen(false);
                              }}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              fromYear={1940}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="doj"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date of Joining</FormLabel>
                        <Popover open={opendoj} onOpenChange={setOpenDoj}>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "justify-between font-normal",
                                  !dojDate && "text-muted-foreground"
                                )}
                              >
                                {dojDate ? dojDate.toLocaleDateString() : "Select date"}
                                <ChevronDownIcon className="w-4 h-4" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dojDate}
                              captionLayout="dropdown"
                              onSelect={(selectedDate) => {
                                setDojDate(selectedDate);
                                if (selectedDate) {
                                  field.onChange(selectedDate.toISOString().split('T')[0]);
                                }
                                setOpenDoj(false);
                              }}
                              disabled={(date) => date > new Date()}
                              fromYear={2000}
                              toYear={new Date().getFullYear()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Professional Info */}
              <div className="space-y-4">
             
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position / Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Developer" {...field} />
                      </FormControl>
                      <FormDescription>Your current role or position</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* About */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="resize-none min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Professional biography</span>
                        <span>{field.value?.length || 0}/500</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="https://your-website.com" {...field} className="pl-9" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <CountryDropdown
                            value={field.value || ''}
                            onChange={(val) => {
                              field.onChange(val);
                              form.setValue('state', '');
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State / Region</FormLabel>
                        <FormControl>
                          <RegionDropdown
                            country={form.watch('country') || ''}
                            value={field.value || ''}
                            onChange={field.onChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!form.watch('country')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your city" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="min-w-[160px]">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {pd?._id ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{pd?._id ? 'Update Profile' : 'Create Profile'}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
