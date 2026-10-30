import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function StartingMoney({ amount, suggested, onChange, cur = '£' }: { amount: string; suggested: number; onChange: (amount: string) => void; cur?: string }) {
  return <div className="grid gap-2">
    <Label htmlFor="starting-money">Starting money ({cur})</Label>
    <Input id="starting-money" type="number" min="0" step="1" value={amount} onChange={event => onChange(event.target.value)} />
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm text-muted-foreground">Suggested: {cur}{suggested.toLocaleString('en-GB')}</p>
      <Button type="button" size="sm" variant="outline" onClick={() => onChange(String(suggested))}>Use suggested amount</Button>
    </div>
  </div>;
}