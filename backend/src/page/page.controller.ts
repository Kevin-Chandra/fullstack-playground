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

  @Get("id/:id")
  getPageDetails(@Param("id") id: string) {
    return this.pageService.findPageDetails(+id);
  }
}
