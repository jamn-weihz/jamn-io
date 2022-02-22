import { Test, TestingModule } from '@nestjs/testing';
import { JamsService } from './jams.service';

describe('JamsService', () => {
  let service: JamsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JamsService],
    }).compile();

    service = module.get<JamsService>(JamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
