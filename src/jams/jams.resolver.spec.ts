import { Test, TestingModule } from '@nestjs/testing';
import { JamsResolver } from './jams.resolver';

describe('JamsResolver', () => {
  let resolver: JamsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JamsResolver],
    }).compile();

    resolver = module.get<JamsResolver>(JamsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
