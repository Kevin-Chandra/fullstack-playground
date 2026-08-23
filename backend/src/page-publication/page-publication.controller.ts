import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { Public } from "../decorators/public.decorator";
import { LoginUserId } from "../decorators/user-details-decorator";
import { JwtGuard } from "../guards/jwt.guard";
import { CreatePublicationDto } from "./dto/create-publication.dto";
import { PagePublicationService } from "./page-publication.service";

@UseGuards(JwtGuard)
@Controller("page/:slug")
export class PagePublicationController {
  constructor(
    private readonly pagePublicationService: PagePublicationService,
  ) {}

  @Public()
  @Get()
  findLive(@Param("slug") slug: string) {
    return this.pagePublicationService.findLive(slug);
  }

  @Get("preview")
  preview(@Param("slug") slug: string) {
    return this.pagePublicationService.preview(slug);
  }

  @Get("publication-preview/:id")
  publicationPreview(@Param("id") publicationId: string) {
    return this.pagePublicationService.publicationPreview(+publicationId);
  }

  @Get("publications")
  listPublications(@Param("slug") slug: string) {
    return this.pagePublicationService.listPublications(slug);
  }

  @Post("publish")
  publish(
    @Param("slug") slug: string,
    @LoginUserId() userId: string,
    @Body() createPublicationDto: CreatePublicationDto,
  ) {
    return this.pagePublicationService.publish(
      slug,
      createPublicationDto,
      +userId,
    );
  }

  /** Resets the draft to the live page, discarding pending edits. */
  @Post("discard")
  discard(@Param("slug") slug: string) {
    return this.pagePublicationService.discard(slug);
  }

  /** Changes what is live only — the draft is left untouched. */
  @Post("publications/:publicationId/rollback")
  rollback(
    @Param("slug") slug: string,
    @Param("publicationId") publicationId: string,
    @LoginUserId() userId: string,
  ) {
    return this.pagePublicationService.rollback(slug, +publicationId, +userId);
  }
}
