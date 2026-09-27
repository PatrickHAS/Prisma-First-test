import { CategoryRepository } from "../repositories/CategoryRepository";

export class CategoryService {
  private readonly categoryRepository: CategoryRepository;

  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  async findAll() {
    return this.categoryRepository.findAll();
  }
}
