import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Sheet, SheetContainer, SheetTitle } from '@/components/sheet/sheet';
import { ToastRoot } from '@/components/toast/toast';
import { toast } from '@/hooks/use-toast';

const SHORT_DURATION_MS = 50;
const LONGER_THAN_DURATION_MS = SHORT_DURATION_MS * 4;

const getToastRegion = () => screen.getByRole('region', { name: /notifications/i, hidden: true });

const showToast = (title: string, duration?: number) => {
  act(() => {
    toast({ title, duration });
  });
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('ToastRoot', () => {
  describe('auto-dismiss', () => {
    it('dismisses a toast once its duration elapses', async () => {
      render(<ToastRoot />);

      showToast('Saved', SHORT_DURATION_MS);
      expect(within(getToastRegion()).getByText('Saved')).toBeTruthy();

      await waitFor(() => expect(within(getToastRegion()).queryByText('Saved')).toBeNull());
    });

    it('keeps a hovered toast open until the pointer leaves', async () => {
      render(<ToastRoot />);

      showToast('Saved', SHORT_DURATION_MS);
      const region = getToastRegion();
      fireEvent.pointerMove(within(region).getByText('Saved'));

      await act(() => sleep(LONGER_THAN_DURATION_MS));
      expect(within(region).getByText('Saved')).toBeTruthy();

      fireEvent.pointerLeave(region);
      await waitFor(() => expect(within(region).queryByText('Saved')).toBeNull());
    });

    it('dismisses the next toast after one is closed while hovered', async () => {
      const user = userEvent.setup();
      render(<ToastRoot />);

      showToast('First', SHORT_DURATION_MS);
      fireEvent.pointerMove(within(getToastRegion()).getByText('First'));
      await user.click(within(getToastRegion()).getByRole('button', { name: 'Close' }));
      await waitFor(() => expect(within(getToastRegion()).queryByText('First')).toBeNull());

      showToast('Second', SHORT_DURATION_MS);
      expect(within(getToastRegion()).getByText('Second')).toBeTruthy();

      await waitFor(() => expect(within(getToastRegion()).queryByText('Second')).toBeNull());
    });
  });

  describe('inside a modal Sheet', () => {
    function ToastBehindSheet({
      isSheetOpen,
      onSheetOpenChange,
    }: {
      isSheetOpen: boolean;
      onSheetOpenChange: (open: boolean) => void;
    }) {
      return (
        <>
          <ToastRoot />
          <Sheet open={isSheetOpen} onOpenChange={onSheetOpenChange}>
            <SheetContainer aria-describedby={undefined}>
              <SheetTitle>Details</SheetTitle>
            </SheetContainer>
          </Sheet>
        </>
      );
    }

    it('closes a toast shown before the sheet opened, leaving the sheet open', async () => {
      const user = userEvent.setup();
      const onSheetOpenChange = vi.fn();
      const { rerender } = render(
        <ToastBehindSheet isSheetOpen={false} onSheetOpenChange={onSheetOpenChange} />
      );

      showToast('Saved');
      rerender(<ToastBehindSheet isSheetOpen onSheetOpenChange={onSheetOpenChange} />);
      await screen.findByRole('dialog');
      expect(document.body.style.pointerEvents).toBe('none');

      await user.click(
        within(getToastRegion()).getByRole('button', { name: 'Close', hidden: true })
      );

      await waitFor(() => expect(within(getToastRegion()).queryByText('Saved')).toBeNull());
      expect(onSheetOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('closes a toast shown while the sheet is open', async () => {
      const user = userEvent.setup();
      render(<ToastBehindSheet isSheetOpen onSheetOpenChange={vi.fn()} />);
      await screen.findByRole('dialog');

      showToast('Saved');
      await user.click(
        within(getToastRegion()).getByRole('button', { name: 'Close', hidden: true })
      );

      await waitFor(() => expect(within(getToastRegion()).queryByText('Saved')).toBeNull());
    });
  });
});
