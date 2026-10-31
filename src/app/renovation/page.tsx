import { Suspense } from 'react';
import RenovationView from '../../components/renovation/RenovationView';

export default function RenovationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-56px)] bg-[#16191f] flex items-center justify-center text-[#ff9900]">
          <span className="w-8 h-8 border-2 border-[#ff9900] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RenovationView />
    </Suspense>
  );
}
