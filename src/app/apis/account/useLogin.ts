import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { GuestLoginResponse } from './LoginRouter';
import { RestLoginRouter } from './RestLoginRouter';

type UseGuestLoginOptions = UseMutationOptions<
  GuestLoginResponse,
  unknown,
  void
>;

export const useGuestLogin = (options?: UseGuestLoginOptions) => {
  return useMutation({
    mutationFn: RestLoginRouter.guestLogin,
    ...options,
  });
};


