import { DataTable } from '@/components/ui/data-table';
import { getUserSession } from '@/lib/auth';
import { trackModel } from '@/models/track';

import { SeparationHeader } from './separation-header';
import { trackTableColumns } from './track-table-columns';

const SeparationPage = async () => {
    const { user } = await getUserSession();
    if (!user) {
        return null;
    }
    const data = await trackModel.findManyByUserId(user.id);
    return (
        <>
            <SeparationHeader />
            <DataTable columns={trackTableColumns} data={data} />
        </>
    );
};

export default SeparationPage;
