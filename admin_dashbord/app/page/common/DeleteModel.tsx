import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';

type DeleteModelProps = {
    onsuccess?: () => void;
    deleteId?: string | number | null;
}

function DeleteModel({ onsuccess, deleteId }: DeleteModelProps) {
    const [open, setOpen] = React.useState(!!deleteId);

    React.useEffect(() => {
        setOpen(!!deleteId);
    }, [deleteId]);

    const handleCancel = () => setOpen(false);

    const handleDelete = () => {
        if (typeof onsuccess === 'function') onsuccess();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Model</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this model? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 flex justify-end gap-2">
                    <Button  variant="secondary" onClick={handleCancel}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default DeleteModel