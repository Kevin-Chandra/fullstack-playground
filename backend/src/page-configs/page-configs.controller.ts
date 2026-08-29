import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guards/jwt.guard";
import { PageConfigDto } from "./dto/page-config.dto";
import { PageConfigsService } from "./page-configs.service";

@UseGuards(JwtGuard)
@Controller("page/:slug/configs")
export class PageConfigsController {
  constructor(private readonly pageConfigsService: PageConfigsService) {}

  @Get()
  findDraft(@Param("slug") slug: string) {
    return this.pageConfigsService.findDraft(slug);
  }

  @Post()
  save(@Param("slug") slug: string, @Body() pageConfig: PageConfigDto) {
    return this.pageConfigsService.save(slug, pageConfig);
  }

  /** Resets the draft to the live page, discarding pending edits. */
  @Post("discard")
  discard(@Param("slug") slug: string) {
    return this.pageConfigsService.discard(slug);
  }
}
