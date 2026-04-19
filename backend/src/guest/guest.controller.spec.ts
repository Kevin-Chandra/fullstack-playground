import { Test, TestingModule } from '@nestjs/testing';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { GuestController } from './guest.controller';
import { GuestService } from './guest.service';

describe('GuestController', () => {
  let controller: GuestController;

  const mockGuestService = {
    create: jest.fn(),
    getGuestById: jest.fn(),
    getGuestByUuid: jest.fn(),
    getGuests: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuestController],
      providers: [
        {
          provide: GuestService,
          useValue: mockGuestService,
        },
      ],
    }).compile();

    controller = module.get<GuestController>(GuestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
