import LeaderboardContent from '@/components/LeaderboardContent';

export default async function LeaderboardOverlay() {
  return (
    <div className="flex flex-col gap-2">
      <LeaderboardContent />
    </div>
  );
}
