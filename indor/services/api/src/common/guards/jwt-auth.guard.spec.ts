import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new JwtAuthGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access to @Public() routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should check isPublic metadata from handler and class', () => {
    const handler = jest.fn();
    const cls = jest.fn();
    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = {
      getHandler: () => handler,
      getClass: () => cls,
    } as unknown as ExecutionContext;

    guard.canActivate(context);

    expect(spy).toHaveBeenCalledWith('isPublic', [handler, cls]);
  });
});
