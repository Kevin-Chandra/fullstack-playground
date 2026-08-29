import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Public } from "../decorators/public.decorator";
import { LoginUserId } from "../decorators/user-details-decorator";
import { JwtGuard } from "../guards/jwt.guard";
import type { PaginateQuery } from "nestjs-paginate";
import { Paginate } from "nestjs-paginate";
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
  publicationPreview(
    @Param("slug") slug: string,
    @Param("id", ParseIntPipe) publicationId: number,
  ) {
    return this.pagePublicationService.publicationPreview(slug, publicationId);
  }

  @Get("publications")
  listPublications(
    @Param("slug") slug: string,
    @Paginate() query: PaginateQuery,
  ) {
    return this.pagePublicationService.listPublications(slug, query);
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

  /** Changes what is live only — the draft is left untouched. */
  @Post("publications/:publicationId/rollback")
  rollback(
    @Param("slug") slug: string,
    @Param("publicationId", ParseIntPipe) publicationId: number,
    @LoginUserId() userId: string,
  ) {
    return this.pagePublicationService.rollback(slug, publicationId, +userId);
  }
}
