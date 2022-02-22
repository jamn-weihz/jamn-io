import { Test, TestingModule } from '@nestjs/testing';
import { ColsResolver } from './cols.resolver';

describe('ColsResolver', () => {
  let resolver: ColsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ColsResolver],
    }).compile();

    resolver = module.get<ColsResolver>(ColsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
