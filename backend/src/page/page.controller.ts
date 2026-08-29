import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtGuard } from "../guards/jwt.guard";
import { PageService } from "./page.service";

@UseGuards(JwtGuard)
@Controller("page")
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  findAll() {
    return this.pageService.findAll();
  }

  @Get(":slug/details")
  getPageDetails(@Param("slug") slug: string) {
    return this.pageService.findPageDetails(slug);
  }
}
