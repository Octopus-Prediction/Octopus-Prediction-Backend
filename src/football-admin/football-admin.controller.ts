import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { Country } from 'src/schemas/country.schema';
import { FootballAdminService } from './football-admin.service';
import { Response } from 'express';
import { Season } from 'src/schemas/season.schema';

@Controller('football-admin')
export class FootballAdminController {
  constructor(private readonly footballAdminService: FootballAdminService) {}

  @Get('scrapeCountries')
  async scrapeCountries(): Promise<Country[]> {
    let countriesNames: string[] =
      await this.footballAdminService.scrapeCountries();

    let countries = [];
    for (let i = 0; i < countriesNames.length; i++) {
      countries.push(
        await this.footballAdminService.saveCountry(countriesNames[i]),
      );
    }
    return countries;
  }

  @Get('scrapeLeagues')
  async scrapeLeagues(): Promise<any> {
    let countries = await this.footballAdminService.getCountries();
    let leagues = [];

    for (let i = 0; i < countries.length; i++) {
      let countryLeaguesNames = await this.footballAdminService.scrapeLeagues(
        countries[i],
      );
      console.log(countryLeaguesNames);
      for (let j = 0; j < countryLeaguesNames.length; j++) {
        leagues.push(
          await this.footballAdminService.saveLeague(
            countryLeaguesNames[j],
            countries[i],
          ),
        );
      }
    }

    return leagues;
  }

  @Get('scrapeTeams')
  async scrapeTeams(): Promise<any> {
    let leagues = await this.footballAdminService.getLeagues();
    for (let i = 0; i < leagues.length; i++) {
      console.log(i + ' league: ' + leagues[i].name);
      let teamsInfo = await this.footballAdminService.scrapeTeams(leagues[i]);

      for (let i = 0; i < teamsInfo.length; i++) {
        let team = await this.footballAdminService.saveTeam(
          teamsInfo[i].teamName,
          teamsInfo[i].teamFlashscoreId,
          teamsInfo[i].logoFlashscoreId,
          teamsInfo[i].countryName,
        );
        console.log(team.name);
      }
    }
  }

  @Get('scrapeFinishedSeasons/:leagueId')
  async scrapeFinishedSeasons(
    @Param('leagueId') leagueId: string,
  ): Promise<any> {
    let finishedSeasonsInfo =
      await this.footballAdminService.scrapeFinishedSeasons(leagueId);

    let finishedSeasons: Season[]=[];
    for (let i = 0; i < finishedSeasonsInfo.length; i++) {
      finishedSeasons.push(
        await this.footballAdminService.saveFinishedSeason(
          leagueId,
          finishedSeasonsInfo[i].seasonName,
          finishedSeasonsInfo[i].winnerFlashscoreId,
          finishedSeasonsInfo[i].winnerName,
        ),
      );
    }

    return finishedSeasons;
  }
}
