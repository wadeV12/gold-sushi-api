import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CategoryResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  items: string[];

  @Expose()
  slug: string;

  @Expose()
  thumbnail: string;

  @Expose()
  get url(): string {
    return `/category/${this.slug}-${this.id}`;
  }
}
