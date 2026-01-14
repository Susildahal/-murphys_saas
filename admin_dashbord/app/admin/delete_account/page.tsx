'use client'
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StrictDeleteModal from '@/app/page/common/StrictDeleteModal'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchProfileByEmail, deleteProfile } from '@/lib/redux/slices/profileSlice'
import { getMee, clearMee } from '@/lib/redux/slices/meeSlice'
import { getAuth, signOut } from 'firebase/auth'
import app from '@/app/config/firebase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import Header from '@/app/page/common/header'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const Page = () => {
    const dispatch = useAppDispatch()
    const router = useRouter()
    const { toast } = useToast()

    const { data: mee, loading: meeLoading } = useAppSelector((state) => state.mee)
    const { profile, loading: profileLoading } = useAppSelector((state) => state.profile)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        if (!mee?.email) dispatch(getMee())
    }, [dispatch, mee])

    useEffect(() => {
        if (mee?.email && !profile) {
            dispatch(fetchProfileByEmail(mee.email))
        }
    }, [dispatch, mee, profile])

    const handleDelete = async () => {
        const idToDelete = profile?._id || profile?.id

        if (!idToDelete) {
            toast({
                title: 'Error',
                description: 'User profile not found.',
                variant: 'destructive',
            })
            return
        }

        setIsDeleting(true)
        try {
            const resultAction = await dispatch(deleteProfile(idToDelete))

            if (deleteProfile.fulfilled.match(resultAction)) {
                const auth = getAuth(app)
                await signOut(auth)
                dispatch(clearMee())

                toast({
                    title: 'Account deleted',
                    description: 'Your account has been permanently removed.',
                })

                router.push('/login')
            } else {
                throw new Error('Deletion failed')
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete account.',
                variant: 'destructive',
            })
            setIsDeleting(false)
            setIsModalOpen(false)
        }
    }

    const confirmString = mee?.email || 'delete my account'

    if (meeLoading || (mee?.email && profileLoading && !profile)) {
        return (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
                Loading account settings…
            </div>
        )
    }

    return (
        <div className="space-y-8  max-w-3xl">
            <Header
                title="Account Settings"
                description="Manage your account preferences and security."
            />

            {/* Danger Zone */}
            <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <CardTitle className="text-lg">Danger Zone</CardTitle>
                    </div>
                    <CardDescription className="text-destructive/80">
                        Actions in this section are permanent and cannot be undone.
                    </CardDescription>
                </CardHeader>

                <Separator className="bg-destructive/20" />

                <CardContent className="pt-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <h4 className="font-medium text-sm">Delete your account</h4>
                            <p className="text-sm text-muted-foreground max-w-md">
                                This will permanently delete your account, profile data,
                                and revoke all access associated with{' '}
                                <span className="font-medium">{mee?.email}</span>.
                            </p>
                        </div>

                        <Button
                            variant="destructive"
                            className="sm:w-auto w-full"
                            onClick={() => setIsModalOpen(true)}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <StrictDeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
                confirmTextString={confirmString}
                loading={isDeleting}
                title="Delete account permanently?"
                description={`This will permanently delete the account associated with ${mee?.email}.`}
            />
        </div>
    )
}

export default Page
