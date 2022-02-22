import { Test, TestingModule } from '@nestjs/testing';
import { ColsService } from './cols.service';

describe('ColsService', () => {
  let service: ColsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColsService],
    }).compile();

    service = module.get<ColsService>(ColsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
