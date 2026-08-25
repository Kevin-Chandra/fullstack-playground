import { IsNotEmpty, IsString, MaxLength } from "class-validator";

/**
 * The object to delete, carried as a query parameter rather than a path
 * segment: a key contains slashes (`page/home/images/abc.jpg`), so a route
 * param would only ever match the first segment of it.
 */
export class MediaDeleteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  key: string;
}
